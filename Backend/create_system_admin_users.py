#!/usr/bin/env python3
"""
Create System Admin Users for Fleet Management System
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
# After DB reset, use developer from create_test_users.py (created first)
ADMIN_EMAIL = "developer@test.com"
ADMIN_PASSWORD = "password123"

def create_system_admin_users():
    """Create system admin users"""
    
    # System admin users to create
    system_admins = [
        {
            "email": "sysadmin@hu.edu.et",
            "password": "password123",
            "name": "System Administrator",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123456"
        },
        {
            "email": "superadmin@hu.edu.et", 
            "password": "password123",
            "name": "Super Administrator",
            "role": "SystemAdmin",
            "phoneNumber": "+251911123457"
        },
        {
            "email": "developer@hu.edu.et",
            "password": "password123", 
            "name": "System Developer",
            "role": "Developer",
            "phoneNumber": "+251911123458"
        }
    ]
    
    print("🔧 Creating System Admin Users...")
    print("=" * 50)
    
    # First, login as existing admin to get token
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            print(f"❌ Failed to login as admin: {login_response.text}")
            return
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        print(f"❌ Error logging in: {e}")
        return
    
    # Create system admin users
    created_count = 0
    for admin_data in system_admins:
        try:
            # Try to create via system-admin endpoint first
            response = requests.post(
                f"{BASE_URL}/system-admin/users",
                json=admin_data,
                headers=headers
            )
            
            if response.status_code == 201:
                user = response.json()
                print(f"✅ Created {admin_data['role']}: {user['name']} ({user['email']})")
                created_count += 1
            elif response.status_code == 409:
                print(f"⚠️  User already exists: {admin_data['email']}")
            else:
                # Fallback to regular user creation
                response = requests.post(
                    f"{BASE_URL}/auth/register",
                    json=admin_data
                )
                
                if response.status_code == 201:
                    user = response.json()
                    print(f"✅ Created {admin_data['role']} (via register): {user['name']} ({user['email']})")
                    created_count += 1
                else:
                    print(f"❌ Failed to create {admin_data['email']}: {response.text}")
                    
        except Exception as e:
            print(f"❌ Error creating {admin_data['email']}: {e}")
    
    print(f"\n📊 Summary: Created {created_count} system admin users")
    
    # Test system admin login
    print("\n🔐 Testing System Admin Login...")
    try:
        test_login = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "sysadmin@hu.edu.et",
            "password": "password123"
        })
        
        if test_login.status_code == 200:
            admin_token = test_login.json()["access_token"]
            print("✅ System admin login successful")
            
            # Test system admin endpoints
            print("\n🧪 Testing System Admin Endpoints...")
            
            # Test get system overview
            overview_response = requests.get(
                f"{BASE_URL}/system-admin/statistics/overview",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            if overview_response.status_code == 200:
                overview = overview_response.json()
                print("✅ System overview endpoint working")
                print(f"   - Total Users: {overview['users']['total']}")
                print(f"   - Total Trips: {overview['trips']['total']}")
                print(f"   - Total Vehicles: {overview['vehicles']['total']}")
            else:
                print(f"❌ System overview failed: {overview_response.text}")
            
            # Test get all users
            users_response = requests.get(
                f"{BASE_URL}/system-admin/users",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            if users_response.status_code == 200:
                users = users_response.json()
                print(f"✅ User management endpoint working - Found {len(users)} users")
                
                # Show system admin users
                admin_users = [u for u in users if u['role'] in ['SystemAdmin', 'Developer']]
                print(f"   - System Admins: {len(admin_users)}")
                for admin in admin_users:
                    print(f"     • {admin['name']} ({admin['role']}) - {admin['email']}")
            else:
                print(f"❌ User management failed: {users_response.text}")
                
        else:
            print(f"❌ System admin login failed: {test_login.text}")
            
    except Exception as e:
        print(f"❌ Error testing system admin: {e}")

if __name__ == "__main__":
    create_system_admin_users()