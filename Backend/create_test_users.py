#!/usr/bin/env python3
"""
Create Test Users for Fleet Management System
This script creates a complete set of test users for testing the approval workflow
"""

import requests
import json
from typing import Optional, Dict, Any

BASE_URL = "http://localhost:3000/api/v1"

class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    RESET = '\033[0m'

def print_colored(text: str, color: str = Colors.WHITE):
    print(f"{color}{text}{Colors.RESET}")

def api_call(method: str, endpoint: str, body: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Make API calls to the backend"""
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "POST":
            response = requests.post(url, json=body, headers=headers)
        elif method == "GET":
            response = requests.get(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print_colored(f"Error: {e}", Colors.RED)
        if hasattr(e.response, 'text'):
            print_colored(f"Response: {e.response.text}", Colors.RED)
        return None

def main():
    print_colored("=" * 50, Colors.CYAN)
    print_colored("Fleet Management System - Test Users", Colors.CYAN)
    print_colored("=" * 50, Colors.CYAN)
    print()

    # Step 0: Create Developer/Admin user first (or use existing)
    print_colored("Step 0: Creating/Using Developer User...", Colors.YELLOW)
    developer = api_call("POST", "/auth/register", {
        "email": "developer@test.com",
        "password": "password123",
        "name": "System Developer",
        "role": "Developer",
        "phoneNumber": "+251911234566"
    })

    if developer:
        # The register endpoint returns {message, data}
        developer_data = developer.get('data', developer)
        print_colored(f"✓ Developer user created: {developer_data.get('email', 'developer@test.com')}", Colors.GREEN)
    else:
        print_colored("Developer user already exists, will use existing account", Colors.YELLOW)
    
    # Login to get token
    print_colored("Logging in as developer...", Colors.YELLOW)
    login_response = api_call("POST", "/auth/login", {
        "email": "developer@test.com",
        "password": "password123"
    })

    if not login_response or 'access_token' not in login_response:
        print_colored("✗ Failed to login as developer", Colors.RED)
        return

    token = login_response['access_token']
    print_colored("✓ Logged in successfully", Colors.GREEN)
    print()

    # Step 1: Create or Get College
    print_colored("Step 1: Creating/Getting College...", Colors.YELLOW)
    college = api_call("POST", "/colleges", {
        "name": "College of Business and Economics",
        "code": "CBE",
        "description": "College of Business and Economics"
    }, token)

    if college:
        print_colored(f"✓ College created: {college['name']} (ID: {college['id']})", Colors.GREEN)
        college_id = college['id']
    else:
        # College might already exist, try to get it
        print_colored("College might already exist, fetching list...", Colors.YELLOW)
        colleges = api_call("GET", "/colleges", None, token)
        if colleges and len(colleges) > 0:
            # Find the CBE college
            college = next((c for c in colleges if c['code'] == 'CBE'), colleges[0])
            college_id = college['id']
            print_colored(f"✓ Using existing college: {college['name']} (ID: {college_id})", Colors.GREEN)
        else:
            print_colored("✗ Failed to create or find college", Colors.RED)
            return

    print()

    # Step 2: Create or Get Department
    print_colored("Step 2: Creating/Getting Department...", Colors.YELLOW)
    department = api_call("POST", "/departments", {
        "name": "Department of Management",
        "code": "MGT",
        "collegeId": college_id,
        "description": "Department of Management"
    }, token)

    if department:
        print_colored(f"✓ Department created: {department['name']} (ID: {department['id']})", Colors.GREEN)
        department_id = department['id']
    else:
        # Department might already exist, try to get it
        print_colored("Department might already exist, fetching list...", Colors.YELLOW)
        departments = api_call("GET", "/departments", None, token)
        if departments and len(departments) > 0:
            # Find the MGT department
            department = next((d for d in departments if d['code'] == 'MGT'), departments[0])
            department_id = department['id']
            print_colored(f"✓ Using existing department: {department['name']} (ID: {department_id})", Colors.GREEN)
        else:
            print_colored("✗ Failed to create or find department", Colors.RED)
            return

    print()
    print_colored("Step 3: Creating Test Users...", Colors.YELLOW)
    print()

    # Create users
    users = [
        {
            "name": "Employee User",
            "email": "employee@test.com",
            "password": "password123",
            "role": "User",
            "phoneNumber": "+251911234567",
            "departmentId": department_id,
            "app": "http://localhost:3001 (Employee App)"
        },
        {
            "name": "Department Head",
            "email": "depthead@test.com",
            "password": "password123",
            "role": "DepartmentHead",
            "phoneNumber": "+251911234568",
            "departmentId": department_id,
            "app": "http://localhost:3002 (Department App)"
        },
        {
            "name": "Dean (College Head)",
            "email": "dean@test.com",
            "password": "password123",
            "role": "Dean",
            "phoneNumber": "+251911234569",
            "collegeId": college_id,
            "app": "http://localhost:3003 (Dean App)"
        },
        {
            "name": "Deployment Team",
            "email": "deployment@test.com",
            "password": "password123",
            "role": "DeploymentTeam",
            "phoneNumber": "+251911234570",
            "app": "http://localhost:3000 (Admin App)"
        },
        {
            "name": "Transport Office",
            "email": "transport@test.com",
            "password": "password123",
            "role": "TransportOffice",
            "phoneNumber": "+251911234571",
            "app": "http://localhost:3000 (Admin App)"
        }
    ]

    created_users = []
    for user_data in users:
        print_colored(f"Creating {user_data['name']}...", Colors.CYAN)
        
        # Prepare registration data
        reg_data = {
            "email": user_data["email"],
            "password": user_data["password"],
            "name": user_data["name"],
            "role": user_data["role"],
            "phoneNumber": user_data["phoneNumber"]
        }
        
        if "departmentId" in user_data:
            reg_data["departmentId"] = user_data["departmentId"]
        if "collegeId" in user_data:
            reg_data["collegeId"] = user_data["collegeId"]
        
        user = api_call("POST", "/auth/register", reg_data)
        
        if user:
            print_colored(f"✓ {user_data['name']} created successfully", Colors.GREEN)
            print_colored(f"  Email: {user_data['email']}", Colors.GRAY)
            print_colored(f"  Password: {user_data['password']}", Colors.GRAY)
            print_colored(f"  Role: {user_data['role']}", Colors.GRAY)
            created_users.append(user_data)
        else:
            print_colored(f"⚠ {user_data['name']} might already exist", Colors.YELLOW)
            print_colored(f"  Email: {user_data['email']}", Colors.GRAY)
            print_colored(f"  Password: {user_data['password']}", Colors.GRAY)
            print_colored(f"  Role: {user_data['role']}", Colors.GRAY)
            created_users.append(user_data)
        
        print()

    # Summary
    print_colored("=" * 50, Colors.CYAN)
    print_colored("Test Users Setup Complete!", Colors.GREEN)
    print_colored("=" * 50, Colors.CYAN)
    print()
    
    print_colored("Organization Structure:", Colors.YELLOW)
    print_colored("  College: College of Business and Economics (CBE)", Colors.WHITE)
    print_colored("    └─ Department: Department of Management (MGT)", Colors.WHITE)
    print()
    
    print_colored("Test Users (All passwords: password123):", Colors.YELLOW)
    print()
    
    print_colored("0. Developer (System Admin)", Colors.WHITE)
    print_colored("   Email: developer@test.com", Colors.GRAY)
    print_colored("   App: http://localhost:3000 (Admin App)", Colors.GRAY)
    print()
    
    for i, user in enumerate(created_users, 1):
        print_colored(f"{i}. {user['name']}", Colors.WHITE)
        print_colored(f"   Email: {user['email']}", Colors.GRAY)
        print_colored(f"   App: {user['app']}", Colors.GRAY)
        print()
    
    print_colored("Testing Workflow:", Colors.YELLOW)
    print_colored("1. Login as employee@test.com and create a trip request", Colors.WHITE)
    print_colored("2. Login as depthead@test.com to approve at department level", Colors.WHITE)
    print_colored("3. Login as dean@test.com to approve at college level (Dean = College Head)", Colors.WHITE)
    print_colored("4. Login as deployment@test.com to allocate vehicle and driver", Colors.WHITE)
    print_colored("", Colors.WHITE)
    print_colored("Note: Dean role serves as the College Head in this system", Colors.YELLOW)
    print()

if __name__ == "__main__":
    main()
