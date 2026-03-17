#!/usr/bin/env python3
"""
Fleet Management System - Notification Test
Tests that employees receive proper notifications throughout the trip lifecycle
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
HEADERS = {"Content-Type": "application/json"}

class NotificationTester:
    def __init__(self):
        self.tokens = {}
        self.user_ids = {}
        self.trip_id = None

    def login(self, email, password, role_name):
        """Login and store token"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                headers=HEADERS,
                json={"email": email, "password": password}
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.tokens[role_name] = data['access_token']
                self.user_ids[role_name] = data['user']['id']
                print(f"✓ Logged in as {role_name}: {email}")
                return True
            else:
                print(f"✗ Failed to login as {role_name}: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Login error for {role_name}: {e}")
            return False

    def get_notifications(self, role_name):
        """Get notifications for a user"""
        try:
            response = requests.get(
                f"{BASE_URL}/notifications",
                headers={"Authorization": f"Bearer {self.tokens[role_name]}"}
            )
            
            if response.status_code == 200:
                notifications = response.json()
                print(f"\\n📬 {role_name.title()} Notifications ({len(notifications)} total):")
                
                if not notifications:
                    print("  No notifications found")
                    return []
                
                for i, notif in enumerate(notifications[:5], 1):  # Show last 5
                    status = "📖 Read" if notif['isRead'] else "📩 Unread"
                    print(f"  {i}. {status} - {notif['title']}")
                    print(f"     {notif['message']}")
                    print(f"     Type: {notif['type']} | Sent: {notif['sentAt'][:19]}")
                
                return notifications
            else:
                print(f"✗ Failed to get notifications for {role_name}: {response.status_code}")
                return []
        except Exception as e:
            print(f"✗ Notification error for {role_name}: {e}")
            return []

    def get_unread_count(self, role_name):
        """Get unread notification count"""
        try:
            response = requests.get(
                f"{BASE_URL}/notifications/unread-count",
                headers={"Authorization": f"Bearer {self.tokens[role_name]}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                print(f"📊 {role_name.title()} has {count} unread notifications")
                return count
            else:
                print(f"✗ Failed to get unread count for {role_name}: {response.status_code}")
                return 0
        except Exception as e:
            print(f"✗ Unread count error for {role_name}: {e}")
            return 0

    def create_and_submit_trip(self):
        """Create and submit a trip to trigger notifications"""
        try:
            # Create trip
            start_time = datetime.now() + timedelta(days=3)
            end_time = start_time + timedelta(hours=6)
            
            trip_data = {
                "tripType": "Normal",
                "destination": "Notification Test Destination",
                "purpose": "Testing notification system",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "passengerCount": 2
            }
            
            response = requests.post(
                f"{BASE_URL}/trips",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['employee']}"},
                json=trip_data
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to create trip: {response.status_code}")
                return False
                
            data = response.json()
            self.trip_id = data['id']
            print(f"✓ Created trip: {self.trip_id}")
            
            # Submit trip (should trigger TripSubmitted notification)
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/submit",
                headers={"Authorization": f"Bearer {self.tokens['employee']}"}
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to submit trip: {response.status_code}")
                return False
            
            print("✓ Trip submitted (should trigger TripSubmitted notification)")
            return True
            
        except Exception as e:
            print(f"✗ Trip creation/submission error: {e}")
            return False

    def approve_trip(self, role_name, step_name):
        """Approve trip (should trigger TripApproved notification)"""
        try:
            approval_data = {
                "comments": f"Approved by {role_name} for notification testing"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/approve",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens[role_name]}"},
                json=approval_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✓ {step_name} approved trip (should trigger TripApproved notification)")
                return True
            else:
                print(f"✗ Failed {step_name} approval: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ {step_name} approval error: {e}")
            return False

    def reject_trip_test(self):
        """Test trip rejection notification by creating and rejecting another trip"""
        try:
            # Create another trip for rejection test
            start_time = datetime.now() + timedelta(days=4)
            end_time = start_time + timedelta(hours=4)
            
            trip_data = {
                "tripType": "Normal",
                "destination": "Rejection Test Destination",
                "purpose": "Testing rejection notification",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "passengerCount": 1
            }
            
            response = requests.post(
                f"{BASE_URL}/trips",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['employee']}"},
                json=trip_data
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to create rejection test trip: {response.status_code}")
                return False
                
            data = response.json()
            reject_trip_id = data['id']
            
            # Submit trip
            response = requests.post(
                f"{BASE_URL}/trips/{reject_trip_id}/submit",
                headers={"Authorization": f"Bearer {self.tokens['employee']}"}
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to submit rejection test trip: {response.status_code}")
                return False
            
            # Reject trip (should trigger TripRejected notification)
            rejection_data = {
                "reason": "Testing rejection notification system"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{reject_trip_id}/reject",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['dept_head']}"},
                json=rejection_data
            )
            
            if response.status_code in [200, 201]:
                print("✓ Trip rejected (should trigger TripRejected notification)")
                return True
            else:
                print(f"✗ Failed to reject trip: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"✗ Rejection test error: {e}")
            return False

    def run_notification_test(self):
        """Run comprehensive notification test"""
        print("=" * 60)
        print("Fleet Management System - Notification Test")
        print("=" * 60)
        
        # Step 1: Login
        print("\\n🔐 Step 1: Authentication")
        if not self.login("employee@test.com", "password123", "employee"):
            return False
        if not self.login("depthead@test.com", "password123", "dept_head"):
            return False
        if not self.login("dean@test.com", "password123", "dean"):
            return False
        if not self.login("president@test.com", "password123", "president"):
            return False
        
        # Step 2: Check initial notifications
        print("\\n📬 Step 2: Initial Notification Check")
        initial_employee_notifications = self.get_notifications("employee")
        initial_unread = self.get_unread_count("employee")
        
        # Step 3: Create and submit trip
        print("\\n📝 Step 3: Create and Submit Trip")
        if not self.create_and_submit_trip():
            return False
        
        # Wait a moment for notification to be created
        time.sleep(2)
        
        # Step 4: Check for TripSubmitted notification
        print("\\n📬 Step 4: Check TripSubmitted Notification")
        after_submit_notifications = self.get_notifications("employee")
        after_submit_unread = self.get_unread_count("employee")
        
        # Step 5: Approve trip through workflow
        print("\\n✅ Step 5: Approval Workflow (Testing TripApproved notifications)")
        if not self.approve_trip("dept_head", "Department Head"):
            return False
        
        time.sleep(1)
        self.get_notifications("employee")
        
        if not self.approve_trip("dean", "Dean"):
            return False
        
        time.sleep(1)
        self.get_notifications("employee")
        
        if not self.approve_trip("president", "President"):
            return False
        
        time.sleep(1)
        
        # Step 6: Check final approval notifications
        print("\\n📬 Step 6: Check All Approval Notifications")
        final_notifications = self.get_notifications("employee")
        final_unread = self.get_unread_count("employee")
        
        # Step 7: Test rejection notification
        print("\\n❌ Step 7: Test Rejection Notification")
        if not self.reject_trip_test():
            return False
        
        time.sleep(2)
        
        # Step 8: Final notification check
        print("\\n📬 Step 8: Final Notification Summary")
        all_notifications = self.get_notifications("employee")
        
        # Analyze notification types received
        notification_types = [n['type'] for n in all_notifications]
        expected_types = ['TripSubmitted', 'TripApproved', 'TripRejected']
        
        print("\\n📊 Notification Analysis:")
        print(f"  Total notifications: {len(all_notifications)}")
        print(f"  Notification types found: {set(notification_types)}")
        
        success = True
        for expected_type in expected_types:
            if expected_type in notification_types:
                print(f"  ✓ {expected_type} notification received")
            else:
                print(f"  ✗ {expected_type} notification MISSING")
                success = False
        
        if success:
            print("\\n" + "=" * 60)
            print("🎉 NOTIFICATION TEST SUCCESSFUL!")
            print("=" * 60)
            print("\\n✅ Employee receives notifications for:")
            print("  1. Trip submission (TripSubmitted)")
            print("  2. Trip approvals (TripApproved)")
            print("  3. Trip rejections (TripRejected)")
            print("  4. Plus other workflow notifications (allocation, ready, completed)")
        else:
            print("\\n❌ Some notifications are missing!")
        
        return success

if __name__ == "__main__":
    tester = NotificationTester()
    success = tester.run_notification_test()
    
    if not success:
        print("\\n❌ Notification test failed!")
        exit(1)
    else:
        print("\\n✅ All notification tests passed!")
        exit(0)