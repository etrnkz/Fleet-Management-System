#!/usr/bin/env python3
"""
Update employee profile with correct name and phone number.
"""

import os
import requests
import sys

BASE = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")
HEADERS_JSON = {"Content-Type": "application/json"}
TIMEOUT = 60

def login_as_developer():
    """Login as developer to get admin token"""
    response = requests.post(
        f"{BASE}/auth/login",
        json={"email": "developer@test.com", "password": "password123"},
        headers=HEADERS_JSON,
        timeout=TIMEOUT,
    )
    if not response.ok:
        print("❌ Failed to login as developer. Please run seed_all.py first.")
        sys.exit(1)
    return response.json()["access_token"]

def get_auth_headers(token):
    return {**HEADERS_JSON, "Authorization": f"Bearer {token}"}

def main():
    print("🔄 Updating employee profile...")
    
    # Get admin token
    token = login_as_developer()
    headers = get_auth_headers(token)
    
    # Get all users
    users_response = requests.get(f"{BASE}/users", headers=headers, timeout=TIMEOUT)
    if not users_response.ok:
        print("❌ Failed to get users")
        sys.exit(1)
    
    users = users_response.json()
    
    # Find employee@test.com
    employee = next((u for u in users if u.get("email") == "employee@test.com"), None)
    if not employee:
        print("❌ employee@test.com not found")
        sys.exit(1)
    
    print(f"✅ Found employee: {employee['name']} (ID: {employee['id']})")
    
    # Update employee's profile
    update_response = requests.patch(
        f"{BASE}/users/{employee['id']}",
        json={
            "name": "Management Employee",
            "phoneNumber": "+251987654321"
        },
        headers=headers,
        timeout=TIMEOUT
    )
    
    if update_response.ok:
        updated_user = update_response.json()
        print(f"✅ Successfully updated employee profile:")
        print(f"👤 Name: {updated_user['name']}")
        print(f"📱 Phone: {updated_user['phoneNumber']}")
        print(f"📧 Email: {updated_user['email']}")
        if updated_user.get('department'):
            print(f"🏢 Department: {updated_user['department']['name']}")
        print("")
        print("🎉 Employee profile updated successfully!")
    else:
        print(f"❌ Failed to update employee profile: {update_response.text}")
        sys.exit(1)

if __name__ == "__main__":
    main()