#!/usr/bin/env python3
"""
Test System Admin Functionality for Fleet Management System
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
SYSTEM_ADMIN_EMAIL = "sysadmin@hu.edu.et"
SYSTEM_ADMIN_PASSWORD = "password123"

def test_system_admin_functionality():
    """Test all system admin functionality"""
    
    print("🔧 Testing System Admin Functionality...")
    print("=" * 60)
    
    # Login as system admin
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": SYSTEM_ADMIN_EMAIL,
            "password": SYSTEM_ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            print(f"❌ Failed to login as system admin: {login_response.text}")
            return
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ System admin login successful")
        
    except Exception as e:
        print(f"❌ Error logging in: {e}")
        return
    
    # Test 1: System Overview
    print("\n📊 Testing System Overview...")
    try:
        overview_response = requests.get(f"{BASE_URL}/system-admin/statistics/overview", headers=headers)
        if overview_response.status_code == 200:
            overview = overview_response.json()
            print("✅ System overview endpoint working")
            print(f"   - Total Users: {overview['users']['total']} (Active: {overview['users']['active']})")
            print(f"   - Total Trips: {overview['trips']['total']} (Pending: {overview['trips']['pending']})")
            print(f"   - Total Vehicles: {overview['vehicles']['total']} (Available: {overview['vehicles']['available']})")
            print(f"   - Total Maintenance: {overview['maintenance']['total']} (Pending: {overview['maintenance']['pending']})")
            print(f"   - System Health: {overview['systemHealth']['status']}")
        else:
     