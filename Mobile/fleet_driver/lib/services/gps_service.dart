import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:vibration/vibration.dart';
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
  final double? currentSpeed; // km/h
  final double? currentHeading;
  final Position? currentPosition;

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
      );
}

class GpsService {
  static const _minIntervalMs = 5000; // Send every 5 seconds

  final _statusController = StreamController<GpsStatus>.broadcast();
  StreamSubscription<Position>? _positionSub;
  DateTime? _lastSent;
  GpsStatus _status = const GpsStatus();
  GeofenceStatus _prevGeofence = GeofenceStatus.clear;
  String? _currentTripId;

  Stream<GpsStatus> get statusStream => _statusController.stream;
  GpsStatus get status => _status;

  Future<void> start(String tripId) async {
    await stop();
    _currentTripId = tripId;

    // 1. Request location permission
    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      _emit(_status.copyWith(
        permissionDenied: true,
        lastError: 'Location permission denied',
      ));
      return;
    }

    // 2. Use REST API only - no WebSocket (more reliable)
    print('📍 Starting GPS with REST API only');
    print('🚫 WebSocket disabled - using REST API for better reliability');

    // 3. Start GPS stream
    _emit(_status.copyWith(active: true, connected: true)); // Mark as connected since we're using REST
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 1, // Update every 1 meter
        timeLimit: Duration(seconds: 1), // Force update every second
      ),
    ).listen(
      (pos) => _onPosition(tripId, pos),
      onError: (e) => _emit(_status.copyWith(lastError: e.toString())),
    );
  }

  Future<void> _onPosition(String tripId, Position pos) async {
    // ALWAYS update UI immediately with current position and speed
    // This ensures UI gets fresh data even if we don't send to backend
    final now = DateTime.now();
    _emit(_status.copyWith(
      currentPosition: pos,
      currentSpeed: pos.speed >= 0 ? pos.speed * 3.6 : null,
      currentHeading: pos.heading,
      lastPostedAt: now, // Update timestamp on every position change
    ));
    
    print('📍 GPS Position: ${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)} @ ${(pos.speed * 3.6).toStringAsFixed(1)} km/h');

    // But only send to backend every 5 seconds to save battery/network
    if (_lastSent != null &&
        now.difference(_lastSent!).inMilliseconds < _minIntervalMs) {
      print('⏭️  Skipping backend send (too soon)');
      return;
    }
    _lastSent = now;

    // Use REST API only - no WebSocket
    try {
      final base = await Storage.getApiBase() ?? kDefaultApiBase;
      final token = await Storage.getAccessToken();
      
      final api = ApiClient(base);
      await api.post('/tracking/$tripId/location', {
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'metadata': {'source': 'flutter-driver-rest'},
        if (pos.speed >= 0) 'speed': pos.speed * 3.6,
        if (pos.heading != 0) 'heading': pos.heading,
        if (pos.altitude != 0) 'altitude': pos.altitude,
        if (pos.accuracy > 0) 'accuracy': pos.accuracy,
      });
      
      print('✅ GPS sent to backend: ${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)} @ ${(pos.speed * 3.6).toStringAsFixed(1)} km/h');
      
      _emit(_status.copyWith(
        lastError: null,
      ));
    } catch (e) {
      print('❌ Failed to send GPS to backend: $e');
      _emit(_status.copyWith(lastError: 'Failed to send location: $e'));
    }
  }

  Future<void> stop() async {
    await _positionSub?.cancel();
    _positionSub = null;

    // No WebSocket to disconnect - REST API only
    _currentTripId = null;
    _status = const GpsStatus();
    _prevGeofence = GeofenceStatus.clear;
    _lastSent = null;
    _emit(_status);
  }

  GeofenceStatus _parseGeo(String s) {
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