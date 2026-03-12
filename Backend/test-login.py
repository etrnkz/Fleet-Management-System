#!/usr/bin/env python3
"""Test login for all created users"""

import requests
import json

BASE_URL = "http://localhost:3000/api/v1"

def test_login(email, password):
    """Test login for a user"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            print(f"✓ {email}: SUCCESS")
            print(f"  Name: {user.get('name')}")
            print(f"  Role: {user.get('role')}")
            print(f"  Department: {user.get('department', {}).get('name', 'N/A')}")
            print(f"  College: {user.get('college', {}).get('name', 'N/A')}")
            return True
        else:
            print(f"✗ {email}: FAILED - {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ {email}: ERROR - {e}")
        return False

def main():
    print("=" * 60)
    print("Testing Login for All Users")
    print("=" * 60)
    print()
    
    users = [
        ("developer@test.com", "password123"),
        ("employee@test.com", "password123"),
        ("depthead@test.com", "password123"),
        ("dean@test.com", "password123"),
        ("deployment@test.com", "password123"),
        ("transport@test.com", "password123"),
    ]
    
    success_count = 0
    for email, password in users:
        if test_login(email, password):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"Results: {success_count}/{len(users)} users can login successfully")
    print("=" * 60)

if __name__ == "__main__":
    main()
