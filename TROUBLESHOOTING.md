# Loijan UI Troubleshooting Guide

## Current Issues & Solutions

### 1. **Sender Can't Post Jobs**
**Problem**: "Failed to post job. Please try again."

**Possible Causes**:
- Backend API endpoint not working
- Authentication token issues
- Missing required fields

**Solutions**:
1. **Check API Connection**: Visit `/api-test` route to test all endpoints
2. **Check Backend**: Ensure Django server is running on `http://127.0.0.1:8000`
3. **Check Token**: Verify user is properly authenticated
4. **Check Console**: Look for detailed error messages in browser console

**Debug Steps**:
```javascript
// In browser console, test API manually:
fetch('http://127.0.0.1:8000/api/jobs/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    goods_name: 'Test Package',
    pickup_location: 'Test Pickup',
    drop_location: 'Test Drop',
    delivery_time: '2024-12-31T10:00:00Z'
  })
})
```

### 2. **Sender Jobs Not Showing**
**Problem**: Senders don't see their posted jobs

**Solutions**:
1. **Check API Endpoint**: The code tries `jobs/my-jobs/` first, falls back to `jobs/`
2. **Backend Implementation**: Ensure backend has proper filtering for user's jobs
3. **Token Authentication**: Verify user token is being sent correctly

**Expected Backend Response**:
```json
[
  {
    "id": 1,
    "goods_name": "Electronics",
    "pickup_location": "123 Main St",
    "drop_location": "456 Oak Ave",
    "delivery_time": "2024-12-31T10:00:00Z",
    "sender": 1
  }
]
```

### 3. **Can't Message Traveler**
**Problem**: Chat functionality not working

**Solutions**:
1. **Check Chat API**: Ensure `/api/chats/` endpoint exists
2. **Check Bid Status**: Chat only works after bidding
3. **Check WebSocket**: If using real-time chat, ensure WebSocket connection

**Expected Flow**:
1. Traveler places bid on job
2. Sender sees bid in job details
3. Both parties can access chat via `/chat/{jobId}`

## Backend Requirements

### Required API Endpoints:

1. **Authentication**:
   ```
   POST /api/accounts/token/
   POST /api/accounts/register/
   GET /api/accounts/profile/
   PUT /api/accounts/profile/
   ```

2. **Jobs**:
   ```
   GET /api/jobs/ (all jobs for travelers)
   GET /api/jobs/my-jobs/ (sender's jobs)
   POST /api/jobs/ (create job)
   GET /api/jobs/{id}/ (job details)
   ```

3. **Bids**:
   ```
   GET /api/bids/ (list bids)
   POST /api/bids/ (place bid)
   ```

4. **Chat**:
   ```
   GET /api/chats/?job_id={jobId} (get messages)
   POST /api/chats/ (send message)
   ```

### Expected Data Models:

**Job Model**:
```json
{
  "id": 1,
  "goods_name": "Electronics",
  "pickup_location": "123 Main St",
  "drop_location": "456 Oak Ave", 
  "delivery_time": "2024-12-31T10:00:00Z",
  "sender": 1,
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Bid Model**:
```json
{
  "id": 1,
  "job": 1,
  "traveler": 2,
  "traveler_username": "john_doe",
  "amount": 50.00,
  "message": "I can deliver this",
  "status": "pending",
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Chat Message Model**:
```json
{
  "id": 1,
  "job": 1,
  "sender": 1,
  "sender_username": "sender_name",
  "text": "Hello, when can you deliver?",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Testing Steps

1. **Start Backend**: Ensure Django server is running
2. **Test API**: Visit `/api-test` route to check all endpoints
3. **Register Users**: Create both sender and traveler accounts
4. **Test Job Posting**: Try posting a job as sender
5. **Test Bidding**: Try placing a bid as traveler
6. **Test Chat**: Try accessing chat after bidding

## Common Error Messages

- **"Failed to post job"**: Check backend API and authentication
- **"No jobs available"**: Check if jobs are being created properly
- **"Failed to load jobs"**: Check API endpoint and authentication
- **"Failed to send message"**: Check chat API endpoint

## Frontend Features Implemented

✅ **Role-based Access**:
- Senders can post jobs
- Travelers can bid on jobs
- Profile management for both roles

✅ **Job Management**:
- Senders see their own jobs
- Travelers see all available jobs
- Job details with bidding

✅ **Chat System**:
- Chat only available after bidding
- Real-time message updates
- User-friendly interface

✅ **Profile System**:
- User profile management
- Role-specific fields
- Edit functionality

## Next Steps

1. **Test API Endpoints**: Use `/api-test` route
2. **Check Backend Logs**: Look for Django server errors
3. **Verify Database**: Ensure data is being saved
4. **Test Authentication**: Verify token-based auth works
5. **Check CORS**: Ensure frontend can access backend

If issues persist, check the browser console and Django server logs for detailed error messages. 