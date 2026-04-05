#!/usr/bin/env python3
"""
Update existing test user to use the correct department from the new organization structure.
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
    print("🔄 Updating user department assignments...")
    
    # Get admin token
    token = login_as_developer()
    headers = get_auth_headers(token)
    
    # Get colleges and departments
    colleges_response = requests.get(f"{BASE}/colleges", headers=headers, timeout=TIMEOUT)
    departments_response = requests.get(f"{BASE}/departments", headers=headers, timeout=TIMEOUT)
    
    if not colleges_response.ok or not departments_response.ok:
        print("❌ Failed to get organization structure")
        sys.exit(1)
    
    colleges = colleges_response.json()
    departments = departments_response.json()
    
    # Find CBE college and Management department
    cbe = next((c for c in colleges if c.get("code") == "CBE"), None)
    if not cbe:
        print("❌ College of Business and Economics (CBE) not found")
        sys.exit(1)
    
    mgmt_dept = next((d for d in departments if d.get("code") == "CBE_MGT"), None)
    if not mgmt_dept:
        print("❌ Management department (CBE_MGT) not found")
        sys.exit(1)
    
    print(f"✅ Found College: {cbe['name']} (ID: {cbe['id']})")
    print(f"✅ Found Department: {mgmt_dept['name']} (ID: {mgmt_dept['id']})")
    
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
    
    # Update employee's department
    update_response = requests.patch(
        f"{BASE}/users/{employee['id']}",
        json={"departmentId": mgmt_dept['id']},
        headers=headers,
        timeout=TIMEOUT
    )
    
    if update_response.ok:
        print(f"✅ Successfully updated employee department to: {mgmt_dept['name']}")
        print(f"📱 Phone number: +251987654321")
        print(f"🏢 Department: {mgmt_dept['name']}")
        print(f"🏛️ College: {cbe['name']}")
        print("")
        print("🎉 Employee profile updated! The department name should now display correctly in the UI.")
    else:
        print(f"❌ Failed to update employee department: {update_response.text}")
        sys.exit(1)

if __name__ == "__main__":
    main()