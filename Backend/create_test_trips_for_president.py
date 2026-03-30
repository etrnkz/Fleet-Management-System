#!/usr/bin/env python3
"""
Create test trips for president approval
"""

import sqlite3
import uuid
from datetime import datetime, timedelta

def create_test_trips():
    conn = sqlite3.connect('fleet_management.db')
    cursor = conn.cursor()
    
    # Get some users to be requesters
    cursor.execute("SELECT id FROM users WHERE role IN ('User', 'DepartmentHead', 'CollegeHead') LIMIT 5")
    users = cursor.fetchall()
    
    if not users:
        print("No users found to create trips for")
        return
    
    # Create test trips in different states
    test_trips = [
        {
            'purpose': 'International Conference on Engineering Education',
            'destination': 'Nairobi, Kenya',
            'state': 'PENDING_PRESIDENT',
            'days_ahead': 15
        },
        {
            'purpose': 'Medical Equipment Transport to Regional Hospital',
            'destination': 'Bahir Dar Hospital',
            'state': 'PENDING_PRESIDENT', 
            'days_ahead': 7
        },
        {
            'purpose': 'University Board Meeting',
            'destination': 'Ministry of Education',
            'state': 'PENDING_PRESIDENT',
            'days_ahead': 3
        },
        {
            'purpose': 'Research Collaboration Meeting',
            'destination': 'Addis Ababa University',
            'state': 'PENDING_PRESIDENT',
            'days_ahead': 10
        },
        {
            'purpose': 'Emergency Medical Transport',
            'destination': 'Black Lion Hospital',
            'state': 'PENDING_PRESIDENT',
            'days_ahead': 1
        }
    ]
    
    created_count = 0
    
    for i, trip_data in enumerate(test_trips):
        if i >= len(users):
            break
            
        trip_id = str(uuid.uuid4())
        request_number = f"REQ-2024-{1000 + i + 1}"
        requester_id = users[i][0]
        
        start_date = datetime.now() + timedelta(days=trip_data['days_ahead'])
        end_date = start_date + timedelta(days=2)  # 2-day trips
        
        cursor.execute("""
            INSERT INTO trip_requests (
                id, requestNumber, tripType, purpose, destination,
                startDateTime, endDateTime, passengerCount, state,
                currentApprovalLevel, estimatedFuelCost, estimatedDistance,
                createdAt, updatedAt, requesterId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trip_id,
            request_number,
            'Normal',
            trip_data['purpose'],
            trip_data['destination'],
            start_date.isoformat(),
            end_date.isoformat(),
            5,  # passenger count
            trip_data['state'],
            'President',
            15000.00,  # estimated fuel cost
            250.0,     # estimated distance
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            requester_id
        ))
        
        created_count += 1
        print(f"Created trip: {request_number} - {trip_data['purpose']}")
    
    conn.commit()
    conn.close()
    
    print(f"\nSuccessfully created {created_count} test trips for president approval")

if __name__ == "__main__":
    create_test_trips()