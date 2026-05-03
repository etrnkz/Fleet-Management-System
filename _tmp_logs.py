"""Check recent backend errors from PM2 logs via health + key endpoints"""
import json, urllib.request, urllib.error

BASE = "https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1"

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except:
            return e.code, {}
    except Exception as e:
        return 0, {"error": str(e)}

def login(email):
    s, r = req("POST", "/auth/login", {"email": email, "password": "Password@123"})
    return r.get("access_token") if s == 201 else None

print("=== HEALTH ===")
s, r = req("GET", "/health")
print(f"  {s} — {r}")

TA = login("admin@haramaya.edu.et")
TT = login("transport@haramaya.edu.et")
TDrv = login("girma.security@haramaya.edu.et")

print(f"\n=== TOKENS ===")
print(f"  admin={bool(TA)} transport={bool(TT)} security_driver={bool(TDrv)}")

# Test the driver-vehicle lookup (the broken endpoint)
if TDrv:
    # Get driver user ID first
    s, me = req("GET", "/users/me", token=TDrv)
    uid = me.get("id", "")
    print(f"\n=== DRIVER ME ===")
    print(f"  {s} — id={uid} role={me.get('role')}")

    print(f"\n=== GET driver-vehicle (userId={uid}) ===")
    s, r = req("GET", f"/tracking/service-vehicle/{uid}/driver-vehicle", token=TDrv)
    print(f"  {s} — {r}")

    print(f"\n=== POST service-vehicle GPS ===")
    # Get vehicle ID from service vehicles list
    s2, svs = req("GET", "/vehicles/service/all", token=TT)
    sec = next((v for v in (svs if isinstance(svs, list) else []) if v.get("serviceVehicleType") == "Security"), None)
    if sec:
        print(f"  Security vehicle: {sec['id']} | {sec['plateNumber']}")
        s3, r3 = req("POST", f"/tracking/service-vehicle/{sec['id']}/location", {
            "latitude": 9.4162, "longitude": 42.0215, "speed": 15.0, "heading": 270
        }, token=TDrv)
        print(f"  GPS post: {s3} — {r3}")
    else:
        print(f"  No security vehicle found. svs={svs}")

# Test fuel records (uuid error)
if TA:
    print(f"\n=== GET /fuel ===")
    s, r = req("GET", "/fuel", token=TA)
    print(f"  {s} — {'OK' if s == 200 else r}")

    print(f"\n=== GET /maintenance ===")
    s, r = req("GET", "/maintenance", token=TA)
    print(f"  {s} — {'OK, count=' + str(len(r)) if s == 200 and isinstance(r, list) else r}")

    print(f"\n=== GET /tracking/service-vehicles/live ===")
    s, r = req("GET", "/tracking/service-vehicles/live", token=TA)
    print(f"  {s} — count={len(r) if isinstance(r, list) else r}")

    print(f"\n=== GET /tracking/live ===")
    s, r = req("GET", "/tracking/live", token=TA)
    print(f"  {s} — count={len(r) if isinstance(r, list) else r}")
