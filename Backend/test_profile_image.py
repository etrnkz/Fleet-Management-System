#!/usr/bin/env python3
"""
Test script for profile image upload functionality
"""

import requests
import base64
import json
import os

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
TEST_EMAIL = "john.doe@university.edu"
TEST_PASSWORD = "password123"

def login():
    """Login and get access token"""
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_profile_image_upload(token):
    """Test profile image upload"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a simple test image (1x1 pixel PNG)
    test_image_data = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
    )
    
    # Upload profile image
    files = {"profileImage": ("test.png", test_image_data, "image/png")}
    response = requests.post(f"{BASE_URL}/users/me/profile-image", 
                           headers={"Authorization": f"Bearer {token}"}, 
                           files=files)
    
    print(f"Upload response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Upload successful: {data.get('message')}")
        return True
    else:
        print(f"Upload failed: {response.text}")
        return False

def test_get_profile(token):
    """Test getting profile with image"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    
    print(f"Get profile response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        has_image = "profileImage" in data and data["profileImage"] is not None
        print(f"Profile has image: {has_image}")
        if has_image:
            print(f"Image data length: {len(data['profileImage'])}")
        return True
    else:
        print(f"Get profile failed: {response.text}")
        return False

def test_remove_profile_image(token):
    """Test removing profile image"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.delete(f"{BASE_URL}/users/me/profile-image", headers=headers)
    
    print(f"Remove image response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Remove successful: {data.get('message')}")
        return True
    else:
        print(f"Remove failed: {response.text}")
        return False

def main():
    print("Testing profile image functionality...")
    
    # Login
    token = login()
    if not token:
        print("Failed to login, exiting...")
        return
    
    print(f"Login successful, token: {token[:20]}...")
    
    # Test upload
    print("\n1. Testing profile image upload...")
    if test_profile_image_upload(token):
        print("✓ Upload test passed")
    else:
        print("✗ Upload test failed")
        return
    
    # Test get profile
    print("\n2. Testing get profile with image...")
    if test_get_profile(token):
        print("✓ Get profile test passed")
    else:
        print("✗ Get profile test failed")
    
    # Test remove
    print("\n3. Testing remove profile image...")
    if test_remove_profile_image(token):
        print("✓ Remove test passed")
    else:
        print("✗ Remove test failed")
    
    # Test get profile after remove
    print("\n4. Testing get profile after remove...")
    if test_get_profile(token):
        print("✓ Final get profile test passed")
    else:
        print("✗ Final get profile test failed")
    
    print("\nProfile image tests completed!")

if __name__ == "__main__":
    main()