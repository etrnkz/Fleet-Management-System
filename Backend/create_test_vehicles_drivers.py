#!/usr/bin/env python3
"""
Create one test vehicle and optional driver profiles (Fleet Management System).

Vehicle status must match API enum: Active, Maintenance, Inactive (not READY).
"""

import os
import requests

BASE_URL = os.environ.get("FLEET_API_BASE", "http://localhost:3000/api/v1").rstrip("/")

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

def api_call(method: str, endpoint: str, body=None, token=None):
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
    print_colored("=" * 60, Colors.CYAN)
    print_colored("Fleet Management System - Test Vehicles & Drivers", Colors.CYAN)
    print_colored("=" * 60, Colors.CYAN)
    print()

    # Login as developer
    print_colored("Logging in as developer...", Colors.YELLOW)
    login_response = api_call("POST", "/auth/login", {
        "email": "developer@test.com",
        "password": "password123"
    })

    if not login_response or 'access_token' not in login_response:
        print_colored("✗ Failed to login", Colors.RED)
        return

    token = login_response['access_token']
    print_colored("✓ Logged in successfully", Colors.GREEN)
    print()

    # One seed vehicle (matches VehicleStatus.Active in API)
    print_colored("Creating test vehicle (one)...", Colors.YELLOW)
    print()

    vehicles = [
        {
            "plateNumber": "AA-12345",
            "make": "Toyota",
            "model": "Coaster",
            "year": 2020,
            "capacity": 30,
            "fuelType": "Diesel",
            "status": "Active",
        },
    ]

    created_vehicles = []
    for vehicle_data in vehicles:
        vehicle = api_call("POST", "/vehicles", vehicle_data, token)
        if vehicle:
            print_colored(f"✓ {vehicle['make']} {vehicle['model']} ({vehicle['plateNumber']})", Colors.GREEN)
            created_vehicles.append(vehicle)
        else:
            print_colored(f"⚠ {vehicle_data['make']} {vehicle_data['model']} might already exist", Colors.YELLOW)
    
    print()

    # Create Drivers
    print_colored("Creating Test Drivers...", Colors.YELLOW)
    print()
    
    drivers = [
        {
            "name": "Ahmed Mohammed",
            "licenseNumber": "DL-001234",
            "phoneNumber": "+251911111111",
            "email": "ahmed.driver@test.com",
            "status": "AVAILABLE"
        },
        {
            "name": "Kebede Alemu",
            "licenseNumber": "DL-005678",
            "phoneNumber": "+251922222222",
            "email": "kebede.driver@test.com",
            "status": "AVAILABLE"
        },
        {
            "name": "Sara Tesfaye",
            "licenseNumber": "DL-009012",
            "phoneNumber": "+251933333333",
            "email": "sara.driver@test.com",
            "status": "AVAILABLE"
        },
        {
            "name": "Dawit Bekele",
            "licenseNumber": "DL-003456",
            "phoneNumber": "+251944444444",
            "email": "dawit.driver@test.com",
            "status": "ON_TRIP"
        },
        {
            "name": "Meron Haile",
            "licenseNumber": "DL-007890",
            "phoneNumber": "+251955555555",
            "email": "meron.driver@test.com",
            "status": "AVAILABLE"
        }
    ]

    created_drivers = []
    for driver_data in drivers:
        driver = api_call("POST", "/drivers", driver_data, token)
        if driver:
            print_colored(f"✓ {driver['name']} ({driver['licenseNumber']})", Colors.GREEN)
            created_drivers.append(driver)
        else:
            print_colored(f"⚠ {driver_data['name']} might already exist", Colors.YELLOW)
    
    print()

    # Summary
    print_colored("=" * 60, Colors.CYAN)
    print_colored("Test Data Created Successfully!", Colors.GREEN)
    print_colored("=" * 60, Colors.CYAN)
    print()
    
    print_colored(f"Vehicles Created: {len(created_vehicles)}", Colors.WHITE)
    print_colored(f"Drivers Created: {len(created_drivers)}", Colors.WHITE)
    print()
    
    print_colored("You can now:", Colors.YELLOW)
    print_colored("1. View vehicles in the admin app", Colors.WHITE)
    print_colored("2. View drivers in the admin app", Colors.WHITE)
    print_colored("3. Allocate vehicles and drivers to approved trips", Colors.WHITE)
    print()

if __name__ == "__main__":
    main()
