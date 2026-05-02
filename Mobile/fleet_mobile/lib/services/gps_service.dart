import 'dart:async';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../core/storage.dart';

enum GeofenceStatus { clear, warning, shutdown }

class GpsStatus {
  final bool active;
  final bool permissionDenied;
  final bool connected;
  final DateTime? lastPostedAt;
  final String? lastError;
  final GeofenceStatus geofenceStatus;
  final String? violationZoneName;
  final double? currentSpeed;
  final double? currentHeading;
  final Position? currentPosition;
  final bool isOffline;
  final int offlineQueueSize;

  const GpsStatus({
    this.active = false,
    this.permissionDenied = false,
    this.connected = false,
    this.lastPostedAt,
    this.lastError,
    this.geofenceStatus = GeofenceStatus.clear,
    this.violationZoneName,
    this.currentSpeed,
    this.currentHeading,
    this.currentPosition,
    this.isOffline = false,
    this.offlineQueueSize = 0,
  });

  GpsStatus copyWith({
    bool? active,
    bool? permissionDenied,
    bool? connected,
    DateTime? lastPostedAt,
    String? lastError,
    GeofenceStatus? geofenceStatus,
    String? violationZoneName,
    double? currentSpeed,
    double? currentHeading,
    Position? currentPosition,
    bool? isOffline,
    int? offlineQueueSize,
  }) =>
      GpsStatus(
        active: active ?? this.active,
        permissionDenied: permissionDenied ?? this.permissionDenied,
        connected: connected ?? this.connected,
        lastPostedAt: lastPostedAt ?? this.lastPostedAt,
        lastError: lastError ?? this.lastError,
        geofenceStatus: geofenceStatus ?? this.geofenceStatus,
        violationZoneName: violationZoneName ?? this.violationZoneName,
        currentSpeed: currentSpeed ?? this.currentSpeed,
        currentHeading: currentHeading ?? this.currentHeading,
        currentPosition: currentPosition ?? this.currentPosition,
        isOffline: isOffline ?? this.isOffline,
        offlineQueueSize: offlineQueueSize ?? this.offlineQueueSize,
      );
}

/// A single buffered location point waiting to be sent.
class _BufferedPoint {
  final double latitude;
  final double longitude;
  final double? speed;
  final double? heading;
  final double? altitude;
  final double? accuracy;
  final String timestamp;

  _BufferedPoint({
    required this.latitude,
    required this.longitude,
    this.speed,
    this.heading,
    this.altitude,
    this.accuracy,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        if (speed != null) 'speed': speed,
        if (heading != null) 'heading': heading,
        if (altitude != null) 'altitude': altitude,
        if (accuracy != null) 'accuracy': accuracy,
        'timestamp': timestamp,
        'isOffline': true,
        'metadata': {'source': 'flutter-offline-buffer'},
      };

  static _BufferedPoint fromJson(Map<String, dynamic> j) => _BufferedPoint(
        latitude: (j['latitude'] as num).toDouble(),
        longitude: (j['longitude'] as num).toDouble(),
        speed: j['speed'] != null ? (j['speed'] as num).toDouble() : null,
        heading: j['heading'] != null ? (j['heading'] as num).toDouble() : null,
        altitude: j['altitude'] != null ? (j['altitude'] as num).toDouble() : null,
        accuracy: j['accuracy'] != null ? (j['accuracy'] as num).toDouble() : null,
        timestamp: j['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      );
}

class GpsService {
  static const _minIntervalMs = 5000;
  static const _maxBufferSize = 500; // max offline points to keep
  static const _prefKeyPrefix = 'gps_offline_buffer_';

  final _statusController = StreamController<GpsStatus>.broadcast();
  StreamSubscription<Position>? _positionSub;
  DateTime? _lastSent;
  GpsStatus _status = const GpsStatus();
  String? _currentTripId;
  String? _currentServiceVehicleId;

  // In-memory offline queue (also persisted to SharedPreferences)
  final List<_BufferedPoint> _offlineQueue = [];
  bool _isFlushing = false;

  Stream<GpsStatus> get statusStream => _statusController.stream;
  GpsStatus get status => _status;

  // ── Start / Stop ──────────────────────────────────────────────────────────

  Future<void> start(String tripId) async {
    await stop();
    _currentTripId = tripId;
    _currentServiceVehicleId = null;
    await _loadOfflineQueue(tripId);
    await _startTracking();
  }

  Future<void> startServiceVehicle(String vehicleId) async {
    await stop();
    _currentServiceVehicleId = vehicleId;
    _currentTripId = null;
    await _loadOfflineQueue(vehicleId);
    await _startTracking();
  }

  Future<void> _startTracking() async {
    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      _emit(_status.copyWith(
        permissionDenied: true,
        lastError: 'Location permission denied',
      ));
      return;
    }

    _emit(_status.copyWith(active: true, connected: true));
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 1,
        timeLimit: Duration(seconds: 1),
      ),
    ).listen(
      (pos) => _onPosition(pos),
      onError: (e) => _emit(_status.copyWith(lastError: e.toString())),
    );
  }

  Future<void> stop() async {
    await _positionSub?.cancel();
    _positionSub = null;
    _currentTripId = null;
    _currentServiceVehicleId = null;
    _status = const GpsStatus();
    _lastSent = null;
    _offlineQueue.clear();
    _emit(_status);
  }

  // ── Position handler ──────────────────────────────────────────────────────

  Future<void> _onPosition(Position pos) async {
    final tripId = _currentTripId;
    final serviceVehicleId = _currentServiceVehicleId;
    final now = DateTime.now();

    // Always update UI immediately
    _emit(_status.copyWith(
      currentPosition: pos,
      currentSpeed: pos.speed >= 0 ? pos.speed * 3.6 : null,
      currentHeading: pos.heading,
      lastPostedAt: now,
    ));

    // Throttle backend sends to every 5 seconds
    if (_lastSent != null &&
        now.difference(_lastSent!).inMilliseconds < _minIntervalMs) {
      return;
    }
    _lastSent = now;

    final point = _BufferedPoint(
      latitude: pos.latitude,
      longitude: pos.longitude,
      speed: pos.speed >= 0 ? pos.speed * 3.6 : null,
      heading: pos.heading != 0 ? pos.heading : null,
      altitude: pos.altitude != 0 ? pos.altitude : null,
      accuracy: pos.accuracy > 0 ? pos.accuracy : null,
      timestamp: now.toIso8601String(),
    );

    try {
      final base = await Storage.getApiBase() ?? kDefaultApiBase;
      final api = ApiClient(base);

      // If there are buffered offline points, flush them first
      if (_offlineQueue.isNotEmpty && !_isFlushing) {
        await _flushOfflineQueue(api, tripId, serviceVehicleId);
      }

      // Send current point
      final body = <String, dynamic>{
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        if (pos.speed >= 0) 'speed': pos.speed * 3.6,
        if (pos.heading != 0) 'heading': pos.heading,
        if (pos.altitude != 0) 'altitude': pos.altitude,
        if (pos.accuracy > 0) 'accuracy': pos.accuracy,
      };

      if (serviceVehicleId != null) {
        body['metadata'] = {'source': 'flutter-service-vehicle'};
        await api.post('/tracking/service-vehicle/$serviceVehicleId/location', body);
      } else if (tripId != null) {
        body['metadata'] = {'source': 'flutter-driver-rest'};
        await api.post('/tracking/$tripId/location', body);
      }

      // Back online — clear offline state
      _emit(_status.copyWith(
        lastError: null,
        isOffline: false,
        offlineQueueSize: _offlineQueue.length,
      ));
      print('✅ GPS sent (queue: ${_offlineQueue.length})');
    } catch (e) {
      // Network failed — buffer this point
      print('📴 Offline — buffering location (queue: ${_offlineQueue.length + 1})');
      _bufferPoint(point, tripId ?? serviceVehicleId ?? 'unknown');
      _emit(_status.copyWith(
        lastError: 'Offline — ${_offlineQueue.length} point(s) buffered',
        isOffline: true,
        offlineQueueSize: _offlineQueue.length,
      ));
    }
  }

  // ── Offline buffer ────────────────────────────────────────────────────────

  void _bufferPoint(_BufferedPoint point, String key) {
    _offlineQueue.add(point);
    // Cap buffer size — drop oldest if over limit
    if (_offlineQueue.length > _maxBufferSize) {
      _offlineQueue.removeAt(0);
    }
    _persistOfflineQueue(key);
  }

  Future<void> _flushOfflineQueue(
    ApiClient api,
    String? tripId,
    String? serviceVehicleId,
  ) async {
    if (_offlineQueue.isEmpty || _isFlushing) return;
    _isFlushing = true;

    final toFlush = List<_BufferedPoint>.from(_offlineQueue);
    print('📤 Flushing ${toFlush.length} offline points...');

    try {
      if (tripId != null) {
        // Bulk upload for regular trips
        final payload = toFlush.map((p) => p.toJson()).toList();
        await api.post('/tracking/$tripId/locations/bulk', {'locations': payload});
      } else if (serviceVehicleId != null) {
        // Bulk upload for service vehicles
        final payload = toFlush.map((p) => p.toJson()).toList();
        await api.post(
          '/tracking/service-vehicle/$serviceVehicleId/locations/bulk',
          {'locations': payload},
        );
      }

      // Success — clear the queue
      _offlineQueue.clear();
      await _clearPersistedQueue(tripId ?? serviceVehicleId ?? 'unknown');
      print('✅ Flushed ${toFlush.length} offline points');
    } catch (e) {
      print('❌ Flush failed: $e');
    } finally {
      _isFlushing = false;
    }
  }

  // ── Persistence (survive app restart) ────────────────────────────────────

  String _prefKey(String id) => '$_prefKeyPrefix$id';

  Future<void> _loadOfflineQueue(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_prefKey(id));
      if (raw == null) return;
      final list = jsonDecode(raw) as List;
      _offlineQueue.clear();
      _offlineQueue.addAll(
        list.map((e) => _BufferedPoint.fromJson(Map<String, dynamic>.from(e))),
      );
      if (_offlineQueue.isNotEmpty) {
        print('📂 Loaded ${_offlineQueue.length} offline points from storage');
        _emit(_status.copyWith(
          isOffline: false,
          offlineQueueSize: _offlineQueue.length,
        ));
      }
    } catch (_) {}
  }

  Future<void> _persistOfflineQueue(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _prefKey(id),
        jsonEncode(_offlineQueue.map((p) => p.toJson()).toList()),
      );
    } catch (_) {}
  }

  Future<void> _clearPersistedQueue(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_prefKey(id));
    } catch (_) {}
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  GeofenceStatus parseGeo(String s) {
    switch (s.toLowerCase()) {
      case 'warning':
        return GeofenceStatus.warning;
      case 'shutdown':
        return GeofenceStatus.shutdown;
      default:
        return GeofenceStatus.clear;
    }
  }

  void _emit(GpsStatus s) {
    _status = s;
    if (!_statusController.isClosed) _statusController.add(s);
  }

  void dispose() {
    stop();
    _statusController.close();
  }
}
