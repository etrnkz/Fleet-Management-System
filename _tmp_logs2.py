import json, urllib.request, urllib.error

BASE = "https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1"

def raw_req(method, path, body=None, token=None):
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

# Login returns 200 (not 201) for POST /auth/login
s, r = raw_req("POST", "/auth/login", {"email": "admin@haramaya.edu.et", "password": "Password@123"})
print(f"Login status: {s}")
print(f"Keys: {list(r.keys())}")
TA = r.get("access_token") or r.get("data", {}).get("access_token")
print(f"Token: {bool(TA)} len={len(TA) if TA else 0}")

if TA:
    # Test all problem endpoints
    tests = [
        ("GET", "/fuel"),
        ("GET", "/maintenance"),
        ("GET", "/tracking/service-vehicles/live"),
        ("GET", "/tracking/live"),
        ("GET", "/vehicles/service/all"),
    ]
    for method, path in tests:
        s2, r2 = raw_req(method, path, token=TA)
        if s2 == 200:
            cnt = len(r2) if isinstance(r2, list) else "ok"
            print(f"  {s2} {path} — {cnt}")
        else:
            print(f"  {s2} {path} — ERROR: {r2.get('message', r2)}")

    # Test driver-vehicle lookup
    s3, me = raw_req("GET", "/users/me", token=TA)
    print(f"\n  /users/me: {s3} id={me.get('id')}")

    # Get security driver token
    s4, dr = raw_req("POST", "/auth/login", {"email": "girma.security@haramaya.edu.et", "password": "Password@123"})
    TDrv = dr.get("access_token")
    print(f"  Security driver login: {s4} token={bool(TDrv)}")
    if TDrv:
        s5, me2 = raw_req("GET", "/users/me", token=TDrv)
        uid = me2.get("id", "")
        print(f"  Driver userId: {uid}")
        s6, r6 = raw_req("GET", f"/tracking/service-vehicle/{uid}/driver-vehicle", token=TDrv)
        print(f"  driver-vehicle: {s6} — {r6}")
