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
  String? _currentServiceVehicleId; // set when tracking a service vehicle

  Stream<GpsStatus> get statusStream => _statusController.stream;
  GpsStatus get status => _status;

  Future<void> start(String tripId) async {
    await stop();
    _currentTripId = tripId;
    _currentServiceVehicleId = null;
    await _startTracking();
  }

  /// Start GPS for a service vehicle (no trip needed).
  Future<void> startServiceVehicle(String vehicleId) async {
    await stop();
    _currentServiceVehicleId = vehicleId;
    _currentTripId = null;
    await _startTracking();
  }

  Future<void> _startTracking() async {
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

  Future<void> _onPosition(Position pos) async {
    final tripId = _currentTripId;
    final serviceVehicleId = _currentServiceVehicleId;

    final now = DateTime.now();
    _emit(_status.copyWith(
      currentPosition: pos,
      currentSpeed: pos.speed >= 0 ? pos.speed * 3.6 : null,
      currentHeading: pos.heading,
      lastPostedAt: now,
    ));

    if (_lastSent != null &&
        now.difference(_lastSent!).inMilliseconds < _minIntervalMs) {
      return;
    }
    _lastSent = now;

    try {
      final base = await Storage.getApiBase() ?? kDefaultApiBase;
      final api = ApiClient(base);
      final body = <String, dynamic>{
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        if (pos.speed >= 0) 'speed': pos.speed * 3.6,
        if (pos.heading != 0) 'heading': pos.heading,
        if (pos.altitude != 0) 'altitude': pos.altitude,
        if (pos.accuracy > 0) 'accuracy': pos.accuracy,
      };

      if (serviceVehicleId != null) {
        // Service vehicle — use vehicle endpoint
        body['metadata'] = {'source': 'flutter-service-vehicle'};
        await api.post('/tracking/service-vehicle/$serviceVehicleId/location', body);
        print('✅ Service vehicle GPS sent: ${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)}');
      } else if (tripId != null) {
        // Regular trip
        body['metadata'] = {'source': 'flutter-driver-rest'};
        await api.post('/tracking/$tripId/location', body);
        print('✅ Trip GPS sent: ${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)} @ ${(pos.speed * 3.6).toStringAsFixed(1)} km/h');
      }

      _emit(_status.copyWith(lastError: null));
    } catch (e) {
      print('❌ Failed to send GPS: $e');
      _emit(_status.copyWith(lastError: 'Failed to send location: $e'));
    }
  }

  Future<void> stop() async {
    await _positionSub?.cancel();
    _positionSub = null;
    _currentTripId = null;
    _currentServiceVehicleId = null;
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