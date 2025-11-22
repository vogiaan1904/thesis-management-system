# Thesis Registration System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT Bearer token authentication.

```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### 1.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "userId": "string",      // Student/Instructor ID
  "password": "string"     // Plain text password
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "userId": "string",
    "fullName": "string",
    "email": "string",
    "role": "STUDENT" | "INSTRUCTOR" | "ADMIN" | "DEPARTMENT",
    "department": "string | null",
    "major": "string | null",
    "program": "string | null"
  }
}
```

### 1.2 Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "userId": "string",
  "password": "string",
  "fullName": "string",
  "email": "string",
  "role": "STUDENT" | "INSTRUCTOR",
  "department": "string (optional)",
  "major": "string (optional, for students)",
  "program": "string (optional, for students)"
}
```

**Response (201):**
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "userId": "string",
    "fullName": "string",
    "email": "string",
    "role": "STUDENT" | "INSTRUCTOR",
    "department": "string | null",
    "major": "string | null",
    "program": "string | null"
  }
}
```

### 1.3 Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "string",
  "userId": "string",
  "fullName": "string",
  "email": "string",
  "role": "STUDENT" | "INSTRUCTOR" | "ADMIN" | "DEPARTMENT",
  "department": "string | null",
  "major": "string | null",
  "program": "string | null"
}
```

### 1.4 Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

---

## 2. Topics Endpoints

### 2.1 Create Topic
**POST** `/topics`

**Headers:** `Authorization: Bearer <token>` (Instructor only)

**Request Body:**
```json
{
  "title": "string",
  "vietnameseTitle": "string",
  "description": "string",
  "maxStudents": "number",
  "program": "UNIVERSITY" | "COLLEGE",
  "majorCode": "string (optional)"
}
```

**Response (201):**
```json
{
  "id": "string",
  "title": "string",
  "vietnameseTitle": "string",
  "description": "string",
  "maxStudents": "number",
  "program": "UNIVERSITY" | "COLLEGE",
  "majorCode": "string | null",
  "instructorId": "string",
  "instructor": {
    "id": "string",
    "userId": "string",
    "fullName": "string",
    "email": "string",
    "department": "string | null"
  },
  "status": "PENDING" | "APPROVED" | "REJECTED",
  "registrationCount": "number",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### 2.2 Get All Topics
**GET** `/topics`

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
status: "PENDING" | "APPROVED" | "REJECTED" (optional)
program: "UNIVERSITY" | "COLLEGE" (optional)
majorCode: string (optional)
search: string (optional, searches title and description)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "vietnameseTitle": "string",
      "description": "string",
      "maxStudents": "number",
      "program": "UNIVERSITY" | "COLLEGE",
      "majorCode": "string | null",
      "instructorId": "string",
      "instructor": {
        "id": "string",
        "userId": "string",
        "fullName": "string",
        "email": "string",
        "department": "string | null"
      },
      "status": "PENDING" | "APPROVED" | "REJECTED",
      "registrationCount": "number",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### 2.3 Get Topic by ID
**GET** `/topics/:id`

**Response (200):**
```json
{
  "id": "string",
  "title": "string",
  "vietnameseTitle": "string",
  "description": "string",
  "maxStudents": "number",
  "program": "UNIVERSITY" | "COLLEGE",
  "majorCode": "string | null",
  "instructorId": "string",
  "instructor": {
    "id": "string",
    "userId": "string",
    "fullName": "string",
    "email": "string",
    "department": "string | null"
  },
  "status": "PENDING" | "APPROVED" | "REJECTED",
  "registrationCount": "number",
  "registrations": [
    {
      "id": "string",
      "student": {
        "id": "string",
        "userId": "string",
        "fullName": "string",
        "email": "string"
      },
      "status": "PENDING" | "APPROVED" | "REJECTED",
      "appliedAt": "string (ISO 8601)"
    }
  ],
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### 2.4 Update Topic
**PATCH** `/topics/:id`

**Headers:** `Authorization: Bearer <token>` (Instructor only, own topics)

**Request Body:**
```json
{
  "title": "string (optional)",
  "vietnameseTitle": "string (optional)",
  "description": "string (optional)",
  "maxStudents": "number (optional)",
  "program": "UNIVERSITY" | "COLLEGE" (optional),
  "majorCode": "string (optional)"
}
```

**Response (200):** Same as Create Topic response

### 2.5 Delete Topic
**DELETE** `/topics/:id`

**Headers:** `Authorization: Bearer <token>` (Instructor only, own topics)

**Response (200):**
```json
{
  "message": "Topic deleted successfully"
}
```

### 2.6 Approve/Reject Topic
**PATCH** `/topics/:id/status`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Request Body:**
```json
{
  "status": "APPROVED" | "REJECTED"
}
```

**Response (200):** Same as Create Topic response

---

## 3. Registrations Endpoints

### 3.1 Apply for Topic
**POST** `/registrations`

**Headers:** `Authorization: Bearer <token>` (Student only)

**Request Body:**
```json
{
  "topicId": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "studentId": "string",
  "topicId": "string",
  "topic": {
    "id": "string",
    "title": "string",
    "vietnameseTitle": "string",
    "instructor": {
      "id": "string",
      "fullName": "string"
    }
  },
  "status": "PENDING",
  "priority": "number",
  "appliedAt": "string (ISO 8601)",
  "reviewedAt": "string | null",
  "reviewedBy": "string | null"
}
```

### 3.2 Get My Applications
**GET** `/registrations/my-applications`

**Headers:** `Authorization: Bearer <token>` (Student only)

**Response (200):**
```json
[
  {
    "id": "string",
    "studentId": "string",
    "topicId": "string",
    "topic": {
      "id": "string",
      "title": "string",
      "vietnameseTitle": "string",
      "description": "string",
      "program": "UNIVERSITY" | "COLLEGE",
      "instructor": {
        "id": "string",
        "userId": "string",
        "fullName": "string",
        "email": "string"
      },
      "status": "PENDING" | "APPROVED" | "REJECTED",
      "registrationCount": "number"
    },
    "status": "PENDING" | "APPROVED" | "REJECTED",
    "priority": "number",
    "appliedAt": "string (ISO 8601)",
    "reviewedAt": "string | null",
    "reviewedBy": "string | null"
  }
]
```

### 3.3 Get Applications for My Topics
**GET** `/registrations/my-topics`

**Headers:** `Authorization: Bearer <token>` (Instructor only)

**Query Parameters:**
```
status: "PENDING" | "APPROVED" | "REJECTED" (optional)
```

**Response (200):**
```json
[
  {
    "id": "string",
    "studentId": "string",
    "student": {
      "id": "string",
      "userId": "string",
      "fullName": "string",
      "email": "string",
      "major": "string | null",
      "program": "string | null"
    },
    "topicId": "string",
    "topic": {
      "id": "string",
      "title": "string",
      "vietnameseTitle": "string"
    },
    "status": "PENDING" | "APPROVED" | "REJECTED",
    "priority": "number",
    "appliedAt": "string (ISO 8601)",
    "reviewedAt": "string | null",
    "reviewedBy": "string | null"
  }
]
```

### 3.4 Review Application
**PATCH** `/registrations/:id/review`

**Headers:** `Authorization: Bearer <token>` (Instructor only)

**Request Body:**
```json
{
  "status": "APPROVED" | "REJECTED"
}
```

**Response (200):**
```json
{
  "id": "string",
  "studentId": "string",
  "student": {
    "id": "string",
    "userId": "string",
    "fullName": "string",
    "email": "string"
  },
  "topicId": "string",
  "topic": {
    "id": "string",
    "title": "string",
    "vietnameseTitle": "string"
  },
  "status": "APPROVED" | "REJECTED",
  "priority": "number",
  "appliedAt": "string (ISO 8601)",
  "reviewedAt": "string (ISO 8601)",
  "reviewedBy": "string"
}
```

### 3.5 Cancel Application
**DELETE** `/registrations/:id`

**Headers:** `Authorization: Bearer <token>` (Student only, own applications)

**Response (200):**
```json
{
  "message": "Application cancelled successfully"
}
```

### 3.6 Get All Registrations
**GET** `/registrations`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10)
status: "PENDING" | "APPROVED" | "REJECTED" (optional)
studentId: string (optional)
topicId: string (optional)
instructorId: string (optional)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "studentId": "string",
      "student": {
        "id": "string",
        "userId": "string",
        "fullName": "string",
        "email": "string",
        "major": "string | null",
        "program": "string | null"
      },
      "topicId": "string",
      "topic": {
        "id": "string",
        "title": "string",
        "vietnameseTitle": "string",
        "instructor": {
          "id": "string",
          "fullName": "string"
        }
      },
      "status": "PENDING" | "APPROVED" | "REJECTED",
      "priority": "number",
      "appliedAt": "string (ISO 8601)",
      "reviewedAt": "string | null",
      "reviewedBy": "string | null"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

## 4. Verification Endpoints

### Verification Flow Overview

After the registration period closes, the department admin verifies accepted registrations against EDUSoft data:

1. **Upload EDUSoft Excel** - Admin uploads Excel file exported from EDUSoft
2. **Batch Processing** - System validates all `INSTRUCTOR_ACCEPTED` registrations
3. **Status Updates** - Each registration is updated to `VERIFIED`, `INVALID_CREDITS`, or `NOT_ENROLLED_EDUSOFT`

### 4.1 Upload EDUSoft Excel for Verification
**POST** `/verification/upload`

**Headers:**
- `Authorization: Bearer <token>` (Admin/Department only)
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
file: Excel file (.xlsx, .xls) - EDUSoft export
semester: string (e.g., "HK251")
```

**Expected Excel Format (from EDUSoft Report):**
| No. | Student ID | Full name | Date of birth | Class | Credits |
|-----|------------|-----------|---------------|-------|---------|
| 1 | ITITIU20001 | Nguyen Van A | 01/01/2002 | IT2020 | 120 |
| 2 | ITITIU20002 | Tran Thi B | 15/03/2002 | IT2020 | 115 |

**Column Mapping:**
- Column 1: No. (row number - skipped)
- Column 2: Student ID (match key)
- Column 3: Full name
- Column 4: Date of birth
- Column 5: Class
- Column 6: Credits (optional - used for validation)

**Note:** The Excel file is exported from EDUSoft and contains students who have enrolled in the thesis course. If Credits column is present, the system validates that credits meet the claimed amount.

**Response (200):**
```json
{
  "id": "string (batch ID)",
  "semester": "string",
  "fileName": "string",
  "uploadedBy": "string",
  "results": {
    "total": "number (total INSTRUCTOR_ACCEPTED registrations processed)",
    "verified": "number",
    "invalidCredits": "number",
    "notEnrolled": "number"
  },
  "createdAt": "string (ISO 8601)"
}
```

**Verification Logic:**
For each `INSTRUCTOR_ACCEPTED` registration:
- Student ID **NOT found** in Excel → Status: `NOT_ENROLLED_EDUSOFT`
- Student ID found, credits insufficient → Status: `INVALID_CREDITS`
- Student ID found, all checks pass → Status: `VERIFIED`

### 4.2 Get Verification History
**GET** `/verification/history`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Response (200):**
```json
[
  {
    "id": "string",
    "semester": "string",
    "fileName": "string",
    "uploadedBy": "string",
    "results": {
      "total": "number",
      "verified": "number",
      "invalidCredits": "number",
      "notEnrolled": "number"
    },
    "errors": "string | null",
    "createdAt": "string (ISO 8601)"
  }
]
```

### 4.3 Get Latest Verification Results
**GET** `/verification/latest`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Response (200):**
```json
{
  "id": "string",
  "semester": "string",
  "fileName": "string",
  "uploadedBy": "string",
  "results": {
    "total": "number",
    "verified": "number",
    "invalidCredits": "number",
    "notEnrolled": "number"
  },
  "errors": "string | null",
  "createdAt": "string (ISO 8601)"
}
```

### 4.4 Get Verification Batch Details
**GET** `/verification/:batchId`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Response (200):**
```json
{
  "id": "string",
  "semester": "string",
  "fileName": "string",
  "uploadedBy": "string",
  "results": {
    "total": "number",
    "verified": "number",
    "invalidCredits": "number",
    "notEnrolled": "number"
  },
  "errors": "string | null",
  "createdAt": "string (ISO 8601)"
}
```

### 4.5 Reprocess Verification Batch
**POST** `/verification/process/:batchId`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

Re-runs the verification process using the previously uploaded Excel file.

**Response (200):**
```json
{
  "id": "string",
  "semester": "string",
  "results": {
    "total": "number",
    "verified": "number",
    "invalidCredits": "number",
    "notEnrolled": "number"
  },
  "message": "Verification reprocessed successfully"
}
```

### Verification Status Reference

| Status | Description |
|--------|-------------|
| `VERIFIED` | Student found in EDUSoft data and meets all requirements |
| `NOT_ENROLLED_EDUSOFT` | Student has not registered for thesis course on EDUSoft |
| `INVALID_CREDITS` | Student does not have sufficient credits (when credit validation is enabled) |
| `DEPARTMENT_REVOKED` | Manually revoked by department admin |

---

## 5. Reports Endpoints

### 5.1 Get Statistics
**GET** `/reports/statistics`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Response (200):**
```json
{
  "topics": {
    "total": "number",
    "approved": "number",
    "pending": "number",
    "rejected": "number"
  },
  "registrations": {
    "total": "number",
    "approved": "number",
    "pending": "number",
    "rejected": "number"
  },
  "students": {
    "total": "number",
    "applied": "number",
    "notApplied": "number",
    "approved": "number"
  },
  "instructors": {
    "total": "number",
    "withTopics": "number",
    "withoutTopics": "number"
  },
  "byProgram": {
    "UNIVERSITY": {
      "topics": "number",
      "registrations": "number"
    },
    "COLLEGE": {
      "topics": "number",
      "registrations": "number"
    }
  },
  "byMajor": [
    {
      "majorCode": "string",
      "topics": "number",
      "registrations": "number"
    }
  ]
}
```

### 5.2 Export Topics
**GET** `/reports/export/topics`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Query Parameters:**
```
status: "PENDING" | "APPROVED" | "REJECTED" (optional)
program: "UNIVERSITY" | "COLLEGE" (optional)
format: "xlsx" | "csv" (default: "xlsx")
```

**Response (200):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`
- Content-Disposition: `attachment; filename="topics_export_YYYY-MM-DD.xlsx"`

**Excel/CSV Columns:**
| ID | Title | Vietnamese Title | Instructor | Department | Program | Status | Max Students | Current Registrations | Created At |
|----|-------|------------------|------------|------------|---------|--------|--------------|----------------------|------------|

### 5.3 Export Registrations
**GET** `/reports/export/registrations`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Query Parameters:**
```
status: "PENDING" | "APPROVED" | "REJECTED" (optional)
program: "UNIVERSITY" | "COLLEGE" (optional)
format: "xlsx" | "csv" (default: "xlsx")
```

**Response (200):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`
- Content-Disposition: `attachment; filename="registrations_export_YYYY-MM-DD.xlsx"`

**Excel/CSV Columns:**
| Registration ID | Student ID | Student Name | Email | Major | Program | Topic Title | Instructor | Status | Priority | Applied At | Reviewed At |
|----------------|------------|--------------|-------|-------|---------|-------------|------------|--------|----------|------------|-------------|

### 5.4 Export Students
**GET** `/reports/export/students`

**Headers:** `Authorization: Bearer <token>` (Admin/Department only)

**Query Parameters:**
```
program: "UNIVERSITY" | "COLLEGE" (optional)
major: string (optional)
hasApplication: boolean (optional)
format: "xlsx" | "csv" (default: "xlsx")
```

**Response (200):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`
- Content-Disposition: `attachment; filename="students_export_YYYY-MM-DD.xlsx"`

**Excel/CSV Columns:**
| Student ID | Full Name | Email | Department | Major | Program | Application Status | Topic Assigned | Instructor |
|------------|-----------|-------|------------|-------|---------|-------------------|----------------|------------|

---

## 6. Notifications Endpoints

### 6.1 Get My Notifications
**GET** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 20)
read: boolean (optional)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "title": "string",
      "message": "string",
      "type": "INFO" | "SUCCESS" | "WARNING" | "ERROR",
      "read": "boolean",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number",
    "unreadCount": "number"
  }
}
```

### 6.2 Mark Notification as Read
**PATCH** `/notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "INFO" | "SUCCESS" | "WARNING" | "ERROR",
  "read": true,
  "createdAt": "string (ISO 8601)"
}
```

### 6.3 Mark All as Read
**PATCH** `/notifications/read-all`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "All notifications marked as read",
  "count": "number"
}
```

### 6.4 Delete Notification
**DELETE** `/notifications/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## 7. Data Models & Enums

### UserRole Enum
```
STUDENT
INSTRUCTOR
ADMIN
DEPARTMENT
```

### Program Enum
```
UNIVERSITY
COLLEGE
```

### TopicStatus Enum
```
PENDING
APPROVED
REJECTED
```

### RegistrationStatus Enum
```
PENDING_INSTRUCTOR_REVIEW    # Initial status after student applies
INSTRUCTOR_ACCEPTED          # Instructor has accepted the application
INSTRUCTOR_DENIED            # Instructor has rejected the application
VERIFIED                     # Verified against EDUSoft data - eligible for thesis
INVALID_CREDITS              # Student does not have sufficient credits
NOT_ENROLLED_EDUSOFT         # Student not registered for thesis on EDUSoft
DEPARTMENT_REVOKED           # Manually revoked by department admin
```

### NotificationType Enum
```
INFO
SUCCESS
WARNING
ERROR
```

---

## 8. Error Responses

All error responses follow this format:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "string or array of validation errors",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "string (e.g., 'User already exists')",
  "error": "Conflict"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 9. WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events Emitted by Server

#### New Registration
```javascript
socket.on('new-registration', (data) => {
  // data structure
  {
    "registrationId": "string",
    "topicId": "string",
    "studentId": "string",
    "studentName": "string"
  }
});
```

#### Registration Reviewed
```javascript
socket.on('registration-reviewed', (data) => {
  // data structure
  {
    "registrationId": "string",
    "topicId": "string",
    "status": "APPROVED" | "REJECTED",
    "reviewedBy": "string"
  }
});
```

#### Topic Status Changed
```javascript
socket.on('topic-status-changed', (data) => {
  // data structure
  {
    "topicId": "string",
    "status": "APPROVED" | "REJECTED",
    "changedBy": "string"
  }
});
```

#### New Notification
```javascript
socket.on('notification', (data) => {
  // data structure
  {
    "id": "string",
    "title": "string",
    "message": "string",
    "type": "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    "createdAt": "string (ISO 8601)"
  }
});
```

---

## 10. Pagination

All paginated endpoints follow this pattern:

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10, max: 100)
```

**Response Meta:**
```json
{
  "meta": {
    "total": "number (total items)",
    "page": "number (current page)",
    "limit": "number (items per page)",
    "totalPages": "number (total pages)"
  }
}
```

---

## 11. System Configuration

### Registration Period
- Registration Start Date: Configured via `REGISTRATION_START_DATE` env
- Registration End Date: Configured via `REGISTRATION_END_DATE` env
- Verification Start Date: Configured via `VERIFICATION_START_DATE` env

### System Limits
- Max Applications Per Student: 3 (configurable via `MAX_APPLICATIONS_PER_STUDENT`)
- Max Students Per Instructor: 10 (configurable via `MAX_STUDENTS_PER_INSTRUCTOR`)
- Session Timeout: 1 hour (configurable via `SESSION_TIMEOUT`)

### File Upload
- Upload Destination: `./uploads` (configurable via `UPLOAD_DEST`)
- Max File Size: 10MB (configurable via `MAX_FILE_SIZE`)
- Allowed File Types: pdf, doc, docx, xls, xlsx, png, jpg, jpeg

---

## 12. Rate Limiting

Currently not implemented, but recommended to add:
- Login endpoint: 5 requests per minute
- Registration endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

---

## 13. CORS Configuration

- Default: All origins allowed (`*`)
- Credentials: Enabled
- Configurable via `CORS_ORIGIN` environment variable

---

## Notes for Client Development

1. **Token Storage**: Store JWT token in localStorage or httpOnly cookie
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **Role Normalization**: Server returns UPPERCASE roles, normalize to lowercase on client
4. **Error Handling**: All endpoints may return validation errors in array format
5. **WebSocket Reconnection**: Implement reconnection logic for WebSocket
6. **File Downloads**: Handle blob responses for export endpoints
7. **Date Formatting**: All dates are in ISO 8601 format
8. **Pagination**: Always check meta.totalPages before requesting next page
9. **Real-time Updates**: Subscribe to WebSocket events for instant updates
10. **Status Codes**: Use HTTP status codes for flow control (304 for cache, etc.)
