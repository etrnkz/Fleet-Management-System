#!/usr/bin/env python3
"""
Update test users with proper department and college associations
"""

import requests
import json

BASE_URL = "http://localhost:3000/api/v1"
HEADERS = {"Content-Type": "application/json"}

def login(email, password):
    """Login and get token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers=HEADERS,
        json={"email": email, "password": password}
    )
    
    if response.status_code in [200, 201]:
        return response.json()['access_token']
    return None

def update_user_associations():
    """Update user associations with departments and colleges"""
    
    # Login as deployment team (has admin privileges)
    token = login("deployment@test.com", "password123")
    if not token:
        print("Failed to login as deployment team")
        return False
    
    auth_headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Get departments and colleges
    dept_response = requests.get(f"{BASE_URL}/departments", headers=auth_headers)
    college_response = requests.get(f"{BASE_URL}/colleges", headers=auth_headers)
    
    if dept_response.status_code != 200 or college_response.status_code != 200:
        print("Failed to get departments or colleges")
        return False
    
    departments = dept_response.json()
    colleges = college_response.json()
    
    if not departments or not colleges:
        print("No departments or colleges found")
        return False
    
    dept_id = departments[0]['id']
    college_id = colleges[0]['id']
    
    print(f"Using Department: {departments[0]['name']} (ID: {dept_id})")
    print(f"Using College: {colleges[0]['name']} (ID: {college_id})")
    
    # Get all users
    users_response = requests.get(f"{BASE_URL}/users", headers=auth_headers)
    if users_response.status_code != 200:
        print("Failed to get users")
        return False
    
    users = users_response.json()
    
    # Update specific users
    user_updates = {
        'employee@test.com': {'departmentId': dept_id, 'collegeId': college_id},
        'depthead@test.com': {'departmentId': dept_id, 'collegeId': college_id},
        'dean@test.com': {'collegeId': college_id},
        'president@test.com': {},  # President doesn't need specific associations
    }
    
    for user in users:
        email = user['email']
        if email in user_updates:
            update_data = user_updates[email]
            if update_data:  # Only update if there's data to update
                response = requests.patch(
                    f"{BASE_URL}/users/{user['id']}",
                    headers=auth_headers,
                    json=update_data
                )
                
                if response.status_code == 200:
                    print(f"✓ Updated {email} with associations")
                else:
                    print(f"✗ Failed to update {email}: {response.status_code}")
            else:
                print(f"✓ {email} doesn't need associations")
    
    return True

if __name__ == "__main__":
    print("Updating user associations...")
    success = update_user_associations()
    
    if success:
        print("✅ User associations updated successfully!")
    else:
        print("❌ Failed to update user associations!")