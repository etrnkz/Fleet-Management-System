import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:vibration/vibration.dart';
import 'fleet_service.dart';

enum GeofenceStatus { clear, warning, shutdown }

class GpsStatus {
  final bool active;
  final bool permissionDenied;
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
  static const _minIntervalMs = 4000;

  final FleetService _fleet;
  final _statusController = StreamController<GpsStatus>.broadcast();
  StreamSubscription<Position>? _positionSub;
  DateTime? _lastSent;
  GpsStatus _status = const GpsStatus();
  GeofenceStatus _prevGeofence = GeofenceStatus.clear;

  Stream<GpsStatus> get statusStream => _statusController.stream;
  GpsStatus get status => _status;

  GpsService(this._fleet);

  Future<void> start(String tripId) async {
    await stop();

    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      _emit(_status.copyWith(permissionDenied: true, lastError: 'Location permission denied'));
      return;
    }

    _emit(_status.copyWith(active: true));

    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 5,
      ),
    ).listen(
      (pos) => _onPosition(tripId, pos),
      onError: (e) => _emit(_status.copyWith(lastError: e.toString())),
    );
  }

  Future<void> stop() async {
    await _positionSub?.cancel();
    _positionSub = null;
    _status = const GpsStatus();
    _prevGeofence = GeofenceStatus.clear;
    _emit(_status);
  }

  Future<void> _onPosition(String tripId, Position pos) async {
    _emit(_status.copyWith(
      currentPosition: pos,
      currentSpeed: pos.speed >= 0 ? pos.speed * 3.6 : null,
      currentHeading: pos.heading,
    ));

    final now = DateTime.now();
    if (_lastSent != null &&
        now.difference(_lastSent!).inMilliseconds < _minIntervalMs) return;
    _lastSent = now;

    try {
      final res = await _fleet.postLocation(
        tripId,
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed: pos.speed >= 0 ? pos.speed * 3.6 : null,
        heading: pos.heading,
        altitude: pos.altitude,
        accuracy: pos.accuracy,
      );

      final geoStr = res['geofenceStatus'] as String? ?? 'clear';
      final geo = _parseGeo(geoStr);
      final zoneName = res['violationZoneName'] as String?;

      // Haptic on shutdown trigger
      if (geo == GeofenceStatus.shutdown && _prevGeofence != GeofenceStatus.shutdown) {
        Vibration.vibrate(pattern: [0, 500, 200, 500, 200, 500]);
      }
      _prevGeofence = geo;

      _emit(_status.copyWith(
        lastPostedAt: DateTime.now(),
        lastError: null,
        geofenceStatus: geo,
        violationZoneName: zoneName,
      ));
    } catch (e) {
      _emit(_status.copyWith(lastError: e.toString()));
    }
  }

  GeofenceStatus _parseGeo(String s) {
    switch (s.toLowerCase()) {
      case 'warning': return GeofenceStatus.warning;
      case 'shutdown': return GeofenceStatus.shutdown;
      default: return GeofenceStatus.clear;
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
