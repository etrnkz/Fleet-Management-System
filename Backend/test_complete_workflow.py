#!/usr/bin/env python3
"""
Fleet Management System - Complete Trip Workflow Test
Tests the entire workflow from trip request to completion
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:3000/api/v1"
HEADERS = {"Content-Type": "application/json"}

class FleetWorkflowTester:
    def __init__(self):
        self.tokens = {}
        self.user_ids = {}
        self.trip_id = None
        self.vehicle_id = None
        self.driver_id = None
        self.driver_user_id = None

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
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Login error for {role_name}: {e}")
            return False

    def create_test_vehicle(self):
        """Create a test vehicle"""
        try:
            vehicle_data = {
                "vehicleId": f"TEST-{int(time.time())}",
                "plateNumber": f"ET-3-{int(time.time()) % 100000}",
                "vehicleType": "Bus",
                "make": "Toyota",
                "model": "Coaster",
                "year": 2023,
                "fuelType": "Diesel",
                "status": "Active",
                "capacity": 30,
                "fuelCapacity": 80,
                "currentMileage": 15000
            }
            
            response = requests.post(
                f"{BASE_URL}/vehicles",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['deployment']}"},
                json=vehicle_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.vehicle_id = data['id']
                print(f"✓ Created test vehicle: {data['plateNumber']} (ID: {self.vehicle_id})")
                return True
            else:
                print(f"✗ Failed to create vehicle: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Vehicle creation error: {e}")
            return False

    def create_test_driver(self):
        """Create a test driver"""
        try:
            # First create user account
            timestamp = int(time.time())
            user_data = {
                "email": f"testdriver{timestamp}@test.com",
                "password": "password123",
                "name": "Ahmed Mohammed",
                "phoneNumber": f"+25191{timestamp % 1000000}",
                "role": "Driver"
            }
            
            response = requests.post(
                f"{BASE_URL}/auth/register",
                headers=HEADERS,
                json=user_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.driver_user_id = data['data']['id']  # Fixed: use data.id
                print(f"✓ Created driver user: {user_data['email']}")
                
                # Now create driver profile
                driver_data = {
                    "userId": self.driver_user_id,
                    "licenseNumber": f"DL-{timestamp}",
                    "licenseExpiry": "2025-12-31T00:00:00.000Z",
                    "experienceYears": 5
                }
                
                response = requests.post(
                    f"{BASE_URL}/drivers",
                    headers={**HEADERS, "Authorization": f"Bearer {self.tokens['deployment']}"},
                    json=driver_data
                )
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    self.driver_id = data['id']
                    print(f"✓ Created driver profile: {driver_data['licenseNumber']} (ID: {self.driver_id})")
                    return True
                else:
                    print(f"✗ Failed to create driver profile: {response.status_code}")
                    print(f"  Response: {response.text}")
                    return False
            else:
                print(f"✗ Failed to create driver user: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Driver creation error: {e}")
            return False

    def create_trip_request(self):
        """Employee creates a trip request"""
        try:
            start_time = datetime.now() + timedelta(days=3)  # Changed from 1 to 3 days
            end_time = start_time + timedelta(hours=10)
            
            trip_data = {
                "tripType": "Normal",
                "destination": "Addis Ababa",
                "purpose": "Business meeting with partners - Complete workflow test",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "passengerCount": 5
            }
            
            response = requests.post(
                f"{BASE_URL}/trips",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['employee']}"},
                json=trip_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.trip_id = data['id']
                print(f"✓ Created trip request: {self.trip_id}")
                print(f"  Destination: {data['destination']}")
                print(f"  State: {data['state']}")
                return True
            else:
                print(f"✗ Failed to create trip: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Trip creation error: {e}")
            return False

    def submit_trip(self):
        """Employee submits trip for approval"""
        try:
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/submit",
                headers={"Authorization": f"Bearer {self.tokens['employee']}"}
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ Trip submitted for approval")
                print(f"  New state: {data['state']}")
                return True
            else:
                print(f"✗ Failed to submit trip: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Trip submission error: {e}")
            return False

    def approve_trip(self, role_name, step_name):
        """Approve trip at different levels"""
        try:
            approval_data = {
                "comments": f"Approved by {role_name} - automated test"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/approve",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens[role_name]}"},
                json=approval_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ {step_name} approved trip")
                print(f"  New state: {data['state']}")
                return True
            else:
                print(f"✗ Failed {step_name} approval: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ {step_name} approval error: {e}")
            return False

    def allocate_resources(self):
        """Deployment team allocates vehicle and driver"""
        try:
            allocation_data = {
                "vehicleId": self.vehicle_id,
                "driverId": self.driver_id,
                "estimatedFuelCost": 150.00,
                "estimatedDistance": 85.5
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/allocate",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['deployment']}"},
                json=allocation_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ Vehicle and driver allocated")
                print(f"  New state: {data['state']}")
                return True
            else:
                print(f"✗ Failed to allocate resources: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Resource allocation error: {e}")
            return False

    def confirm_transport(self):
        """Transport office confirms transport is ready"""
        try:
            confirm_data = {
                "fuelApproved": True
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/confirm-transport",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=confirm_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ Transport confirmed ready")
                print(f"  New state: {data['state']}")
                return True
            else:
                print(f"✗ Failed to confirm transport: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Transport confirmation error: {e}")
            return False

    def start_trip(self):
        """Driver starts the trip"""
        try:
            # First get trip details to get the allocated vehicle's plate number
            response = requests.get(
                f"{BASE_URL}/trips/{self.trip_id}",
                headers={"Authorization": f"Bearer {self.tokens['transport']}"}
            )
            
            if response.status_code != 200:
                print(f"✗ Failed to get trip details: {response.status_code}")
                return False
                
            trip_data = response.json()
            plate_number = trip_data['allocatedVehicle']['plateNumber']
            
            start_data = {
                "plateNumber": plate_number,
                "scannerValidation": True,
                "startingMileage": 15000,
                "fuelLevel": 80,
                "notes": "Trip started on time - automated test"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/start",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=start_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ Trip started")
                print(f"  New state: {data['state']}")
                return True
            else:
                print(f"✗ Failed to start trip: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Trip start error: {e}")
            return False

    def add_tracking_data(self):
        """Add GPS tracking data"""
        try:
            tracking_data = {
                "latitude": 9.0320,
                "longitude": 38.7469,
                "speed": 45,
                "heading": 180,
                "accuracy": 5
            }
            
            response = requests.post(
                f"{BASE_URL}/tracking/{self.trip_id}/location",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=tracking_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✓ GPS tracking data added")
                return True
            else:
                print(f"✗ Failed to add tracking data: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Tracking data error: {e}")
            return False

    def complete_trip(self):
        """Complete the trip"""
        try:
            completion_data = {
                "actualDistance": 200.5,
                "actualFuelCost": 145.75,
                "finalMileage": 15200,
                "endingMileage": 15200,
                "fuelLevel": 65,
                "notes": "Trip completed successfully - automated test"
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/complete",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['transport']}"},
                json=completion_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                print(f"✓ Trip completed")
                print(f"  Final state: {data['state']}")
                return True
            else:
                print(f"✗ Failed to complete trip: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Trip completion error: {e}")
            return False

    def submit_feedback(self):
        """Employee submits feedback for completed trip"""
        try:
            feedback_data = {
                "overallRating": 4,
                "driverRating": 5,
                "vehicleRating": 4,
                "punctualityRating": 4,
                "comments": "Great trip! Driver was very professional and punctual.",
                "suggestions": "Could improve vehicle air conditioning.",
                "wouldRecommend": True,
                "issues": []
            }
            
            response = requests.post(
                f"{BASE_URL}/trips/{self.trip_id}/feedback",
                headers={**HEADERS, "Authorization": f"Bearer {self.tokens['employee']}"},
                json=feedback_data
            )
            
            if response.status_code in [200, 201]:
                print(f"✓ Feedback submitted successfully")
                return True
            else:
                print(f"✗ Failed to submit feedback: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Feedback submission error: {e}")
            return False

    def get_feedback_statistics(self):
        """Get feedback statistics"""
        try:
            response = requests.get(
                f"{BASE_URL}/trips/feedback/statistics",
                headers={"Authorization": f"Bearer {self.tokens['transport']}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\\n📊 Feedback Statistics:")
                print(f"  Total Feedbacks: {data['totalFeedbacks']}")
                if data['totalFeedbacks'] > 0:
                    print(f"  Average Overall Rating: {data['averageRatings']['overall']}/5")
                    print(f"  Recommendation Rate: {data['recommendationRate']:.1f}%")
                return True
            else:
                print(f"✗ Failed to get feedback statistics: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Feedback statistics error: {e}")
            return False

    def get_trip_details(self):
        """Get final trip details"""
        try:
            response = requests.get(
                f"{BASE_URL}/trips/{self.trip_id}",
                headers={"Authorization": f"Bearer {self.tokens['employee']}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\\n📋 Final Trip Details:")
                print(f"  ID: {data['id']}")
                print(f"  Destination: {data['destination']}")
                print(f"  Purpose: {data['purpose']}")
                print(f"  State: {data['state']}")
                print(f"  Vehicle: {data.get('allocatedVehicle', {}).get('plateNumber', 'N/A')}")
                print(f"  Driver: {data.get('allocatedDriver', {}).get('user', {}).get('name', 'N/A')}")
                return True
            else:
                print(f"✗ Failed to get trip details: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Trip details error: {e}")
            return False

    def run_complete_workflow(self):
        """Run the complete workflow"""
        print("=" * 60)
        print("Fleet Management System - Complete Workflow Test")
        print("=" * 60)
        
        # Step 1: Login all users
        print("\\n🔐 Step 1: Authentication")
        if not self.login("employee@test.com", "password123", "employee"):
            return False
        if not self.login("depthead@test.com", "password123", "dept_head"):
            return False
        if not self.login("dean@test.com", "password123", "dean"):
            return False
        if not self.login("president@test.com", "password123", "president"):
            return False
        if not self.login("deployment@test.com", "password123", "deployment"):
            return False
        if not self.login("transport@test.com", "password123", "transport"):
            return False
        
        # Step 2: Create test resources
        print("\\n🚗 Step 2: Create Test Resources")
        if not self.create_test_vehicle():
            return False
        if not self.create_test_driver():
            return False
        
        # Step 3: Trip request workflow
        print("\\n📝 Step 3: Trip Request Workflow")
        if not self.create_trip_request():
            return False
        if not self.submit_trip():
            return False
        
        # Step 4: Approval workflow
        print("\\n✅ Step 4: Approval Workflow")
        if not self.approve_trip("dept_head", "Department Head"):
            return False
        if not self.approve_trip("dean", "Dean"):
            return False
        if not self.approve_trip("president", "President"):
            return False
        
        # Step 5: Resource allocation
        print("\\n🚛 Step 5: Resource Allocation")
        if not self.allocate_resources():
            return False
        if not self.confirm_transport():
            return False
        
        # Step 6: Trip execution
        print("\\n🛣️  Step 6: Trip Execution")
        if not self.start_trip():
            return False
        if not self.add_tracking_data():
            return False
        if not self.complete_trip():
            return False
        
        # Step 7: Verification
        print("\\n🔍 Step 7: Verification and Feedback")
        if not self.get_trip_details():
            return False
        if not self.submit_feedback():
            return False
        if not self.get_feedback_statistics():
            return False
        
        print("\\n" + "=" * 60)
        print("🎉 COMPLETE WORKFLOW TEST SUCCESSFUL!")
        print("=" * 60)
        print(f"\\n✓ Trip ID: {self.trip_id}")
        print(f"✓ Vehicle ID: {self.vehicle_id}")
        print(f"✓ Driver ID: {self.driver_id}")
        print("\\nThe trip has gone through the complete lifecycle:")
        print("  1. Employee created and submitted request")
        print("  2. Department Head approved")
        print("  3. Dean approved")
        print("  4. President approved")
        print("  5. Deployment team allocated vehicle and driver")
        print("  6. Transport was confirmed ready")
        print("  7. Driver started the trip")
        print("  8. GPS tracking data was recorded")
        print("  9. Trip was completed successfully")
        print("  10. Employee submitted feedback")
        print("  11. Feedback statistics were generated")
        
        return True

if __name__ == "__main__":
    tester = FleetWorkflowTester()
    success = tester.run_complete_workflow()
    
    if not success:
        print("\\n❌ Workflow test failed!")
        exit(1)
    else:
        print("\\n✅ All tests passed!")
        exit(0)