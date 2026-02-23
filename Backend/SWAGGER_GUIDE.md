# Swagger API Documentation Guide

## 🎯 Quick Access

**Open in your browser**: http://localhost:3000/api/docs

## 📸 What You'll See

The Swagger UI provides an interactive interface to explore and test all API endpoints.

## 🏷️ API Tags (Categories)

The API is organized into the following categories:

### 1. **App** - System Information
- Root endpoint
- Health check
- System status
- Version information

### 2. **Authentication** - User Auth
- Login
- Register
- Refresh token
- Logout

### 3. **Users** (Coming Soon)
- User management
- Profile operations
- User search

### 4. **Departments** (Coming Soon)
- Department CRUD
- Department hierarchy

### 5. **Colleges** (Coming Soon)
- College management
- College operations

### 6. **Vehicles** (Coming Soon)
- Vehicle management
- Availability checking
- Vehicle status

### 7. **Drivers** (Coming Soon)
- Driver management
- Driver assignments
- Performance tracking

### 8. **Trips** (Coming Soon)
- Trip requests
- Trip approval workflow
- Trip tracking

### 9. **Workflow** (Coming Soon)
- Workflow configuration
- State management
- Approval chains

### 10. **Deployment** (Coming Soon)
- Vehicle allocation
- Driver assignment

### 11. **Transport** (Coming Soon)
- Transport office operations
- Fuel management

### 12. **Maintenance** (Coming Soon)
- Maintenance requests
- Inspection workflow

### 13. **Fuel** (Coming Soon)
- Fuel tracking
- Cost management

### 14. **Tracking** (Coming Soon)
- Real-time GPS tracking
- Location history

### 15. **Notifications** (Coming Soon)
- Notification management
- Push notifications

### 16. **Reports** (Coming Soon)
- Analytics
- Report generation

### 17. **Audit** (Coming Soon)
- Audit logs
- Activity tracking

## 🔐 How to Test Protected Endpoints

### Step 1: Register or Login

1. Expand the **Authentication** tag
2. Click on `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
3. Click **"Try it out"**
4. Fill in the request body:

**For Registration:**
```json
{
  "email": "test@example.com",
  "password": "Test@123",
  "name": "Test User",
  "role": "driver"
}
```

**For Login:**
```json
{
  "email": "test@example.com",
  "password": "Test@123"
}
```

5. Click **"Execute"**
6. Copy the `access_token` from the response

### Step 2: Authorize

1. Click the **"Authorize"** button at the top right (🔓 icon)
2. In the popup, enter: `Bearer <your_access_token>`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Protected Endpoints

Now you can test any protected endpoint:
1. Expand any endpoint
2. Click **"Try it out"**
3. Fill in required parameters
4. Click **"Execute"**
5. View the response

## 📋 Testing Examples

### Example 1: Health Check (No Auth Required)

1. Expand **App** tag
2. Click `GET /api/v1/health`
3. Click **"Try it out"**
4. Click **"Execute"**
5. See response:
```json
{
  "status": "OK",
  "uptime": 123.45,
  "timestamp": "2026-02-24T00:00:00.000Z",
  "database": "connected",
  "memoryUsage": {
    "heapUsed": "24 MB",
    "heapTotal": "26 MB",
    "rss": "17 MB"
  },
  "nodeVersion": "v24.12.0",
  "platform": "win32"
}
```

### Example 2: Register New User

1. Expand **Authentication** tag
2. Click `POST /api/v1/auth/register`
3. Click **"Try it out"**
4. Modify the request body:
```json
{
  "email": "john.doe@school.edu",
  "password": "SecurePass@123",
  "name": "John Doe",
  "role": "driver"
}
```
5. Click **"Execute"**
6. Check response for success

### Example 3: Login

1. Click `POST /api/v1/auth/login`
2. Click **"Try it out"**
3. Enter credentials:
```json
{
  "email": "john.doe@school.edu",
  "password": "SecurePass@123"
}
```
4. Click **"Execute"**
5. Copy the `access_token` from response

## 🎨 Swagger UI Features

### Available Features:
- ✅ **Interactive Testing** - Execute API calls directly from browser
- ✅ **Request/Response Examples** - See sample data for each endpoint
- ✅ **Schema Definitions** - View data models and validation rules
- ✅ **Authentication** - Test protected endpoints with JWT
- ✅ **Persistent Auth** - Authorization persists across page refreshes
- ✅ **Response Codes** - See all possible HTTP status codes
- ✅ **Try It Out** - Real-time API testing
- ✅ **Download Spec** - Export OpenAPI specification

### UI Elements:
- **Green** = GET requests (Read operations)
- **Blue** = POST requests (Create operations)
- **Orange** = PUT/PATCH requests (Update operations)
- **Red** = DELETE requests (Delete operations)

## 🔍 Understanding Responses

### Success Responses (2xx)
- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Success with no response body

### Client Error Responses (4xx)
- **400 Bad Request** - Invalid input/validation error
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded

### Server Error Responses (5xx)
- **500 Internal Server Error** - Server-side error

## 📊 Rate Limiting

Some endpoints have rate limiting:

- **Login**: 5 attempts per minute
- **Register**: 3 attempts per hour
- **General**: 10 requests per minute (default)

If you hit the limit, you'll see:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

Wait for the time window to reset and try again.

## 🛠️ Advanced Features

### Download OpenAPI Spec

1. Visit: http://localhost:3000/api/docs-json
2. Save the JSON file
3. Import into Postman, Insomnia, or other API clients

### Curl Commands

Each endpoint shows a curl command example. Click the **"Copy"** button to copy it.

Example:
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "test@example.com",
  "password": "Test@123"
}'
```

## 🎯 Tips & Tricks

1. **Persistent Authorization**: Your JWT token persists even after page refresh
2. **Expand All**: Click "Expand Operations" to see all endpoints at once
3. **Models**: Scroll down to see all data models/schemas
4. **Servers**: Switch between Local and Production servers (top dropdown)
5. **Dark Mode**: Swagger UI adapts to your browser's theme
6. **Keyboard Shortcuts**: Use Tab to navigate between fields

## 🚨 Common Issues

### Issue: "Cannot GET /api/docs"
**Solution**: Make sure the server is running (`npm run start:dev`)

### Issue: "401 Unauthorized"
**Solution**: 
1. Login first to get a token
2. Click "Authorize" and enter: `Bearer <token>`
3. Make sure token hasn't expired (15 minutes)

### Issue: "429 Too Many Requests"
**Solution**: Wait for the rate limit window to reset (check X-RateLimit-Reset header)

### Issue: "400 Bad Request - Validation Error"
**Solution**: Check the request body matches the schema exactly

## 📚 Additional Resources

- **OpenAPI Specification**: http://localhost:3000/api/docs-json
- **Health Check**: http://localhost:3000/api/v1/health
- **System Status**: http://localhost:3000/api/v1/status
- **Version Info**: http://localhost:3000/api/v1/version

## 🎓 Learning Path

1. Start with **App** endpoints (no auth required)
2. Test **Authentication** endpoints
3. Authorize with JWT token
4. Explore other endpoints as they're implemented
5. Check response schemas and examples
6. Try different scenarios (success, errors, edge cases)

---

**Happy Testing! 🚀**

For issues or questions, check the main documentation or create an issue on GitHub.
