import '../core/api_client.dart';
import '../core/storage.dart';

class FleetService {
  final ApiClient _api;
  FleetService(String base) : _api = ApiClient(base);

  static Future<FleetService> create() async {
    final base = await Storage.getApiBase() ?? kDefaultApiBase;
    return FleetService(base);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    });
    return Map<String, dynamic>.from(res);
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await _api.get('/users/me');
    return Map<String, dynamic>.from(res);
  }

  Future<void> updateProfile(String name, String phone) async {
    await _api.patch('/users/me', {'name': name, 'phoneNumber': phone});
  }

  Future<void> changePassword(String current, String newPw) async {
    await _api.patch('/users/me/password', {
      'currentPassword': current,
      'newPassword': newPw,
    });
  }

  Future<void> updateDriverProfile({
    required String licenseNumber,
    required String licenseExpiry,
    int experienceYears = 0,
  }) async {
    await _api.patch('/users/me/driver-profile', {
      'licenseNumber': licenseNumber,
      'licenseExpiry': licenseExpiry,
      'experienceYears': experienceYears,
    });
  }

  // ── Trips ─────────────────────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getTrips() async {
    final res = await _api.get('/trips');
    return List<Map<String, dynamic>>.from(res as List);
  }

  Future<List<Map<String, dynamic>>> getAssignedTrips(String userId) async {
    final trips = await getTrips();
    return trips.where((t) {
      final state = t['state'] as String? ?? '';
      return ['READY', 'CAR_ALLOCATED'].contains(state) &&
          _matchesDriver(t, userId);
    }).toList();
  }

  Future<List<Map<String, dynamic>>> getActiveTrips(String userId) async {
    final trips = await getTrips();
    return trips.where((t) {
      return t['state'] == 'IN_PROGRESS' && _matchesDriver(t, userId);
    }).toList();
  }

  Future<List<Map<String, dynamic>>> getCompletedTrips(String userId) async {
    final trips = await getTrips();
    return trips.where((t) {
      return t['state'] == 'COMPLETED' && _matchesDriver(t, userId);
    }).toList();
  }

  bool _matchesDriver(Map<String, dynamic> trip, String userId) {
    final driver = trip['allocatedDriver'] as Map<String, dynamic>?;
    if (driver == null) return false;
    final user = driver['user'] as Map<String, dynamic>?;
    final driverId = user?['id'] ?? driver['userId'] ?? '';
    return driverId == userId;
  }

  Future<void> rejectAssignment(String tripId, String reason) async {
    await _api.post('/trips/$tripId/driver-reject', {'reason': reason});
  }

  // ── Vehicle ───────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>?> getAssignedVehicle(String userId) async {
    final trips = await getTrips();
    for (final t in trips) {
      final state = t['state'] as String? ?? '';
      if (!['READY', 'CAR_ALLOCATED', 'IN_PROGRESS'].contains(state)) continue;
      if (!_matchesDriver(t, userId)) continue;
      return t['allocatedVehicle'] as Map<String, dynamic>?;
    }
    return null;
  }

  // ── Maintenance ───────────────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getMaintenance() async {
    final res = await _api.get('/maintenance');
    return List<Map<String, dynamic>>.from(res as List);
  }

  Future<void> createMaintenance({
    required String vehicleId,
    required String description,
    required String priority,
  }) async {
    await _api.post('/maintenance', {
      'vehicleId': vehicleId,
      'issueDescription': description,
      'priority': priority,
    });
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getNotifications() async {
    final res = await _api.get('/notifications');
    return List<Map<String, dynamic>>.from(res as List);
  }

  Future<void> markNotificationRead(String id) async {
    await _api.patch('/notifications/$id/read', {});
  }

  Future<void> markAllNotificationsRead() async {
    await _api.patch('/notifications/read-all', {});
  }

  // ── GPS Tracking ──────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> postLocation(
    String tripId, {
    required double latitude,
    required double longitude,
    double? speed,
    double? heading,
    double? altitude,
    double? accuracy,
  }) async {
    final body = <String, dynamic>{
      'latitude': latitude,
      'longitude': longitude,
      'metadata': {'source': 'flutter-driver'},
    };
    if (speed != null) body['speed'] = speed;
    if (heading != null) body['heading'] = heading;
    if (altitude != null) body['altitude'] = altitude;
    if (accuracy != null) body['accuracy'] = accuracy;

    final res = await _api.post('/tracking/$tripId/location', body);
    return Map<String, dynamic>.from(res ?? {});
  }

  // ── Service Vehicle ───────────────────────────────────────────────────────

  /// Returns the service vehicle (shuttle/security) assigned to this driver user, or null.
  Future<Map<String, dynamic>?> getMyServiceVehicle(String userId) async {
    try {
      final res = await _api.get('/tracking/service-vehicle/$userId/driver-vehicle');
      if (res == null) return null;
      return Map<String, dynamic>.from(res);
    } catch (_) {
      return null;
    }
  }

  /// Post GPS location for a service vehicle (no trip needed).
  Future<void> postServiceVehicleLocation(
    String vehicleId, {
    required double latitude,
    required double longitude,
    double? speed,
    double? heading,
    double? altitude,
    double? accuracy,
  }) async {
    final body = <String, dynamic>{
      'latitude': latitude,
      'longitude': longitude,
      'metadata': {'source': 'flutter-service-vehicle'},
    };
    if (speed != null) body['speed'] = speed;
    if (heading != null) body['heading'] = heading;
    if (altitude != null) body['altitude'] = altitude;
    if (accuracy != null) body['accuracy'] = accuracy;
    await _api.post('/tracking/service-vehicle/$vehicleId/location', body);
  }
}
