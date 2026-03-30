#!/usr/bin/env python3
"""
Create maintenance team users for testing
"""

import requests
import json

BASE_URL = "http://localhost:3000/api/v1"
HEADERS = {"Content-Type": "application/json"}

def create_maintenance_users():
    """Create maintenance team users"""
    
    # Login as deployment team (has admin privileges)
    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers=HEADERS,
        json={"email": "deployment@test.com", "password": "password123"}
    )
    
    if response.status_code not in [200, 201]:
        print("Failed to login as deployment team")
        return False
    
    token = response.json()['access_token']
    auth_headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Create maintenance team user
    maintenance_user = {
        "email": "maintenance@test.com",
        "password": "password123",
        "name": "Maintenance Team Lead",
        "phoneNumber": "+251911234567",
        "role": "MaintenanceTeam"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/register",
        headers=HEADERS,
        json=maintenance_user
    )
    
    if response.status_code in [200, 201]:
        print("✓ Created maintenance team user: maintenance@test.com")
    else:
        print(f"✗ Failed to create maintenance user: {response.status_code}")
        print(f"  Response: {response.text}")
    
    # Create driver user if needed
    driver_user = {
        "email": "driver@test.com",
        "password": "password123",
        "name": "Test Driver",
        "phoneNumber": "+251911234568",
        "role": "Driver"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/register",
        headers=HEADERS,
        json=driver_user
    )
    
    if response.status_code in [200, 201]:
        print("✓ Created driver user: driver@test.com")
    else:
        print(f"✗ Failed to create driver user: {response.status_code}")
        print(f"  Response: {response.text}")
    
    return True

if __name__ == "__main__":
    print("Creating maintenance users...")
    success = create_maintenance_users()
    
    if success:
        print("✅ Maintenance users created successfully!")
    else:
        print("❌ Failed to create maintenance users!")