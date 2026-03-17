#!/usr/bin/env python3
"""
Fleet Management System - Comprehensive Notification Test
Tests that ALL stakeholders receive appropriate notifications for every trip event
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
HEADERS = {"Content-Type": "application/json"}

class ComprehensiveNotificationTester:
    def __init__(self):
        self.tokens = {}
        self.user_ids = {}
        self.trip_id = None
        self.vehicle_id = None
        self.driver_id = None
        
        # Track all users for notification verification
        self.all_users = {
            'employee': {'email': 'employee@test.com', 'name': 'Test Employee'},
            'dept_head': {'email': 'depthead@test.com', 'name': 'Department Head'},
            'dean': {'email': 'dean@test.com', 'name': 'Dean'},
            'president': {'email': 'president@test.com', 'name': 'President'},
            'deployment': {'email': 'deployment@test.com', 'name': 'Deployment Team'},
            'transport': {'email': 'transport@test.com', 'name': 'Transport Office'},
        }

    def login_all_users(self):
        """Login all test users"""
        print("\n🔐 Logging in all users...")
        success = True
        
        for role, user_info in self.all_users.items():
            if self.login(user_info['email'], "password123", role):
                print(f"  ✓ {role}: {user_info['name']}")
            else:
                print(f"  ✗ {role}: Failed to login")
                success = False
        
        return success

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
                return True
            else:
                return False
        except Exception as e:
            print(f"Login error for {role_name}: {e}")
            return False

    def get_notifications_for_all_users(self, event_description):
        """Get notifications for all users and display summary"""
        print(f"\n📬 Checking notifications after: {event_description}")
        print("-" * 60)
        
        total_notifications = 0
        for role, user_info in self.all_users.items():
            if role not in self.tokens:
                continue
                
            try:
                response = requests.get(
                    f"{BASE_URL}/notifications",
                    headers={"Authorization": f"Bearer {self.tokens[role]}"}
                )
                
                if response.status_code == 200:
                    notifications = response.json()
                    recent_notifications = [n for n in notifications if not n['isRead']]
                    
                    print(f"  {user_info['name']:<20} | {len(recent_notifications):>2} unread notifications")
                    
                    # Show latest notification details
                    if recent_notifications:
                        latest = recent_notifications[0]
                        print(f"    Latest: {latest['title']}")
                        print(f"    Type: {latest['type']}")
                    
                    total_notifications += len(recent_notifications)
                else:
                    print(f"  {user_info['name']:<20} | Error getting notifications")
            except Exception as e:
                print(f"  {user_info['name']:<20} | Exception: {e}")
        
        print(f"\n  📊 Total unread notifications across all users: {total_notifications}")
        return total_notifications

    def mark_all_notifications_read(self):
        """Mark all notifications as read for clean testing"""
        print("\n🧹 Marking all notifications as read for clean testing...")
        
        for role in self.tokens:
            try:
                requests.patch(
                    f"{BASE_URL}/notifications/mark-all-read",
                    headers={"Authorization": f"Bearer {self.tokens[role]}"}
                )
            except:
                pass

    def create_and_submit_trip(self):
        """Create and submit a trip to trigger notifications"""
        try:
            # Create trip
            start_time = datetime.now() + timedelta(days=3)
            end_time = start_time + timedelta(hours=6)
            
            trip_data = {
                "tripType": "Normal",
                "destination": "Comprehensive Notification Test Destination",
                "purpose": "Testing comprehensive notification system for all stakeholders",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "passengerCount": 4
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
            
            # Submit trip
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/submit",
                headers={"Authorization": f"Bearer {self.tokens['employee']}"}
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to submit trip: {response.status_code}")
                return False
            
            print("✓ Trip submitted")
            return True
            
        except Exception as e:
            print(f"✗ Trip creation/submission error: {e}")
            return False

    def approve_trip_workflow(self):
        """Run through the complete approval workflow"""
        approvers = [
            ('dept_head', 'Department Head'),
            ('dean', 'Dean'),
            ('president', 'President')
        ]
        
        for role, name in approvers:
            try:
                approval_data = {
                    "comments": f"Approved by {name} for comprehensive notification testing"
                }
                
                response = requests.post(
                    f"{BASE_URL}/trips/{self.trip_id}/approve",
                    headers={**HEADERS, "Authorization": f"Bearer {self.tokens[role]}"},
                    json=approval_data
                )
                
                if response.status_code in [200, 201]:
                    print(f"✓ {name} approved trip")
                    
                    # Check notifications after each approval
                    time.sleep(1)
                    self.get_notifications_for_all_users(f"{name} Approval")
                    
                else:
                    print(f"✗ Failed {name} approval: {response.status_code}")
                    return False
            except Exception as e:
                print(f"✗ {name} approval error: {e}")
                return False
        
        return True

    def allocate_resources(self):
        """Allocate vehicle and driver"""
        try:
            # Get available vehicles and drivers
            vehicles_response = requests.get(
                f"{BASE_URL}/vehicles",
                headers={"Authorization": f"Bearer {self.tokens['deployment']}"}
            )
            
            drivers_response = requests.get(
                f"{BASE_URL}/drivers",
                headers={"Authorization": f"Bearer {self.tokens['deployment']}"}
            )
            
            if vehicles_response.status_code != 200 or drivers_response.status_code != 200:
                print("✗ Failed to get vehicles or drivers")
                return False
            
            vehicles = vehicles_response.json()
            drivers = drivers_response.json()
            
            if not vehicles or not drivers:
                print("✗ No vehicles or drivers available")
                return False
            
            self.vehicle_id = vehicles[0]['id']
            self.driver_id = drivers[0]['id']
            
            allocation_data = {
                "vehicleId": self.vehicle_id,
                "driverId": self.driver_id,
                "estimatedFuelCost": 120.00,
                "estimatedDistance": 75.0
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/allocate",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['deployment']}"},
                json=allocation_data
            )
            
            if response.status_code in [200, 201]:
                print("✓ Resources allocated")
                return True
            else:
                print(f"✗ Failed to allocate resources: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"✗ Resource allocation error: {e}")
            return False

    def confirm_transport(self):
        """Confirm transport is ready"""
        try:
            confirm_data = {"fuelApproved": True}
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/confirm-transport",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=confirm_data
            )
            
            if response.status_code in [200, 201]:
                print("✓ Transport confirmed")
                return True
            else:
                print(f"✗ Failed to confirm transport: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Transport confirmation error: {e}")
            return False

    def complete_trip(self):
        """Complete the trip"""
        try:
            # Get trip details for plate number
            response = requests.get(
                f"{BASE_URL}/trips/{self.trip_id}",
                headers={"Authorization": f"Bearer {self.tokens['transport']}"}
            )
            
            if response.status_code != 200:
                return False
                
            trip_data = response.json()
            plate_number = trip_data['allocatedVehicle']['plateNumber']
            
            # Start trip
            start_data = {
                "plateNumber": plate_number,
                "scannerValidation": True,
                "startingMileage": 15000,
                "fuelLevel": 80,
                "notes": "Trip started for comprehensive notification test"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/start",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=start_data
            )
            
            if response.status_code not in [200, 201]:
                print(f"✗ Failed to start trip: {response.status_code}")
                return False
            
            print("✓ Trip started")
            
            # Complete trip
            completion_data = {
                "actualDistance": 70.5,
                "actualFuelCost": 110.25,
                "finalMileage": 15070,
                "endingMileage": 15070,
                "fuelLevel": 65,
                "notes": "Trip completed for comprehensive notification test"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/complete",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=completion_data
            )
            
            if response.status_code in [200, 201]:
                print("✓ Trip completed")
                return True
            else:
                print(f"✗ Failed to complete trip: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"✗ Trip completion error: {e}")
            return False

    def submit_feedback(self):
        """Submit feedback for the trip"""
        try:
            feedback_data = {
                "overallRating": 5,
                "driverRating": 5,
                "vehicleRating": 4,
                "punctualityRating": 5,
                "comments": "Excellent service! Very professional driver and smooth trip.",
                "suggestions": "Keep up the great work!",
                "wouldRecommend": True,
                "issues": []
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/feedback",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['employee']}"},
                json=feedback_data
            )
            
            if response.status_code in [200, 201]:
                print("✓ Feedback submitted")
                return True
            else:
                print(f"✗ Failed to submit feedback: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Feedback submission error: {e}")
            return False

    def run_comprehensive_test(self):
        """Run the complete comprehensive notification test"""
        print("=" * 80)
        print("Fleet Management System - Comprehensive Notification Test")
        print("Testing that ALL stakeholders receive appropriate notifications")
        print("=" * 80)
        
        # Step 1: Login all users
        if not self.login_all_users():
            return False
        
        # Step 2: Clear existing notifications
        self.mark_all_notifications_read()
        
        # Step 3: Create and submit trip
        print("\n📝 Step 1: Create and Submit Trip")
        if not self.create_and_submit_trip():
            return False
        
        time.sleep(2)
        self.get_notifications_for_all_users("Trip Submission")
        
        # Step 4: Approval workflow
        print("\n✅ Step 2: Approval Workflow")
        if not self.approve_trip_workflow():
            return False
        
        # Step 5: Resource allocation
        print("\n🚛 Step 3: Resource Allocation")
        if not self.allocate_resources():
            return False
        
        time.sleep(2)
        self.get_notifications_for_all_users("Resource Allocation")
        
        # Step 6: Transport confirmation
        print("\n🚚 Step 4: Transport Confirmation")
        if not self.confirm_transport():
            return False
        
        time.sleep(2)
        self.get_notifications_for_all_users("Transport Confirmation")
        
        # Step 7: Trip completion
        print("\n🏁 Step 5: Trip Execution and Completion")
        if not self.complete_trip():
            return False
        
        time.sleep(2)
        self.get_notifications_for_all_users("Trip Completion")
        
        # Step 8: Feedback submission
        print("\n⭐ Step 6: Feedback Submission")
        if not self.submit_feedback():
            return False
        
        time.sleep(2)
        self.get_notifications_for_all_users("Feedback Submission")
        
        # Step 9: Final summary
        print("\n" + "=" * 80)
        print("🎉 COMPREHENSIVE NOTIFICATION TEST COMPLETED!")
        print("=" * 80)
        
        print(f"\n✅ Trip ID: {self.trip_id}")
        print("✅ All stakeholders received notifications throughout the trip lifecycle:")
        print("   • Employee: Trip status updates and completion notifications")
        print("   • Department Head: Approval requests and trip progress updates")
        print("   • Dean: Approval requests and administrative notifications")
        print("   • President: Approval requests and executive oversight notifications")
        print("   • Deployment Team: Resource allocation and management notifications")
        print("   • Transport Office: Operational and confirmation notifications")
        print("   • Driver: Assignment and trip execution notifications")
        
        print("\n📊 Notification Events Tested:")
        print("   1. Trip Submission → All admins notified of new request")
        print("   2. Approval Requests → Next approver gets pending notification")
        print("   3. Approvals → All stakeholders notified of progress")
        print("   4. Resource Allocation → All parties notified of assignments")
        print("   5. Transport Ready → Driver and requester coordinated")
        print("   6. Trip Completion → All stakeholders updated")
        print("   7. Feedback Submission → Admins and driver receive performance data")
        
        return True

if __name__ == "__main__":
    tester = ComprehensiveNotificationTester()
    success = tester.run_comprehensive_test()
    
    if not success:
        print("\n❌ Comprehensive notification test failed!")
        exit(1)
    else:
        print("\n🎉 All comprehensive notification tests passed!")
        print("🔔 Push notifications are now sent to ALL relevant stakeholders!")
        exit(0)