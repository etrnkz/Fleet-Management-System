import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
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
  static const _minIntervalMs = 4000;

  final _statusController = StreamController<GpsStatus>.broadcast();
  StreamSubscription<Position>? _positionSub;
  io.Socket? _socket;
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

    // 2. Connect WebSocket
    await _connectSocket(tripId);

    // 3. Start GPS stream
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

  Future<void> _connectSocket(String tripId) async {
    final base = await Storage.getApiBase() ?? kDefaultApiBase;
    final token = await Storage.getAccessToken();

    // Strip /api/v1 to get the socket server root
    final wsUrl = base.replaceAll(RegExp(r'/api/v\d+$'), '');

    _socket = io.io(
      '$wsUrl/tracking',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(999)
          .setReconnectionDelay(2000)
          .setExtraHeaders(token != null ? {'Authorization': 'Bearer $token'} : {})
          .setQuery({'token': token ?? ''})
          .build(),
    );

    _socket!.onConnect((_) {
      _emit(_status.copyWith(connected: true, lastError: null));
      // Join the trip room so we receive geofence responses
      _socket!.emit('join-trip', {'tripId': tripId});
    });

    _socket!.onDisconnect((_) {
      _emit(_status.copyWith(connected: false));
    });

    _socket!.onConnectError((e) {
      _emit(_status.copyWith(
        connected: false,
        lastError: 'WebSocket connection failed: $e',
      ));
    });

    // Listen for location-update ack from server (contains geofence status)
    _socket!.on('location-update', (data) {
      if (data is Map) {
        final loc = data['location'] as Map?;
        if (loc != null) _handleServerResponse(loc);
      }
    });

    _socket!.connect();
  }

  void _handleServerResponse(Map<dynamic, dynamic> loc) {
    final geoStr = loc['geofenceStatus'] as String? ?? 'clear';
    final geo = _parseGeo(geoStr);
    final zoneName = loc['violationZoneName'] as String?;

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

    final payload = <String, dynamic>{
      'tripId': tripId,
      'location': {
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'metadata': {'source': 'flutter-driver-ws'},
        if (pos.speed >= 0) 'speed': pos.speed * 3.6,
        if (pos.heading != 0) 'heading': pos.heading,
        if (pos.altitude != 0) 'altitude': pos.altitude,
        if (pos.accuracy > 0) 'accuracy': pos.accuracy,
      },
    };

    if (_socket != null && _socket!.connected) {
      // Send via WebSocket
      _socket!.emitWithAck('update-location', payload, ack: (response) {
        if (response is Map) {
          final loc = response['location'] as Map?;
          if (loc != null) _handleServerResponse(loc);
        }
      });
    } else {
      // Fallback to REST if socket is disconnected
      _emit(_status.copyWith(lastError: 'WebSocket disconnected — retrying…'));
    }
  }

  Future<void> stop() async {
    await _positionSub?.cancel();
    _positionSub = null;

    if (_socket != null) {
      if (_currentTripId != null) {
        _socket!.emit('leave-trip', {'tripId': _currentTripId});
      }
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }

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
