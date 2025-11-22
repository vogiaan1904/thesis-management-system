# Always update this CLAUDE.md file to be up-to-date with the context


# Theme
- The theme color should be plum red #7C2946 (all the buttons, ... will be this color, maybe the status of the application can be red, blue, green, yellow,...). and the main background is still white


# Recent Fixes (2024)

## Authentication & Navigation
- Fixed login persistence issue where users were logged out on navigation
- Updated ProtectedRoute to check loading state before redirecting
- Modified AuthContext to immediately load stored user from localStorage
- Updated API interceptors to dispatch custom events instead of hard redirects
- Fixed ErrorBoundary to use `import.meta.env.DEV` for Vite compatibility

## TypeScript Type Safety
- Completely refactored all components to match server API response structure
- Updated field names across all dashboards and modals:
  - `topic.title` → `topic.titleVn`
  - `topic.availableSlots/totalSlots` → Calculate from `maxStudents - currentStudents`
  - `application.selfReportedCredits` → `application.creditsClaimed`
  - `application.actualCredits` → `application.creditsVerified`
  - `application.reviewerNotes` → `application.instructorComment`
  - Status values: `'Active'` → `'ACTIVE'`, `'Full'` → `'FULL'`
- Added optional chaining for nested objects (e.g., `topic.instructor?.department`)
- Fixed mockData.ts to match TypeScript types

## Critical Fixes
- **InstructorDashboard**: Added optional chaining for `topic.instructor?.department` to prevent crashes when instructor object is not populated in API response
- **AdminDashboard**: Fixed `applications.filter is not a function` error by updating `applicationService.getAll()` to return paginated response (`PaginatedResponse<ThesisApplication>`) and extracting data array with `appsData.data`
- **API Service**: Updated `applicationService.getAll()` to match the pattern of `topicService.getAll()` with proper pagination support
- **Application Review**: Fixed validation error on review endpoint - changed `notes` to `comment` in `applicationService.updateStatus()` to match server DTO field name
- All builds now complete successfully with no TypeScript errors


# Topic Model (Updated)
The ThesisTopic model has been enhanced with comprehensive fields:

## Topic Identification
- `topicCode`: Format like HK251-DCLV-010 (Semester-Type-Number)
- `topicType`: One of GD1-DCLV, GD1-ĐACN, GD1-ĐAMHKTMT, LVTN, ĐATN
- `title`: Vietnamese title
- `titleEn`: English title (optional)

## Instructor Information
- `instructorTitle`: Academic title (ThS., TS., PGS., etc.)
- `instructorEmployeeId`: Employee ID (e.g., 003282)
- `instructorDepartment`: Department/Faculty
- Standard fields: `instructorId`, `instructorName`, `instructorEmail`

## Topic Configuration
- `status`: Active, Inactive, or Full
- `programTypes`: Array of allowed programs (CQ, CN, B2, SN, VLVH, TX)
- `department`: Academic department
- `totalSlots`, `availableSlots`, `pendingApplications`

## Topic Content
- `description`: Detailed description in Vietnamese
- `phase1Requirements`: Preliminary research requirements
- `phase2Requirements`: Thesis implementation requirements
- `references`: Array of academic papers/resources
- `requiredSkills`: Prerequisites and skills needed

## Features Implemented
- TopicBrowser displays comprehensive topic information with code, type, status badges
- TopicDetailModal provides full detailed view including requirements and references
- InstructorDashboard shows extended topic information for instructors
- Theme color (#7C2946) applied to buttons, badges, and UI elements
- Support for Vietnamese and English titles


# Admin Dashboard (Registration Management)

The AdminDashboard has been redesigned from a dashboard view to a focused registration management interface.

## Features
- **Search**: Full-text search across student name, ID, email, topic title, and instructor name
- **Status Filter**: Dropdown to filter by registration status (Accepted, Verified, Invalid Credits, Not Enrolled, Revoked)
- **Stats Bar**: Quick summary showing total, accepted, verified, and invalid counts
- **Data Table**: Comprehensive table with all registration details

## Row Actions (Dropdown Menu)
Each registration row has a 3-dot menu with the following actions:
- **View Details**: Opens a modal with complete registration information
- **Send Email**: Opens email client to contact the student
- **Revoke**: Available for accepted/verified registrations - opens revoke modal with reason input
- **Delete**: Permanently removes the registration (with confirmation)

## Header Actions
- **Export**: Download registrations as Excel file
- **Upload EDUSoft**: Upload EDUSoft data for batch verification
- **Refresh**: Reload registration data

## Detail Modal
Shows comprehensive registration information:
- Student details (name, ID, email)
- Topic and instructor information
- Credits (claimed vs verified)
- Motivation letter
- Instructor and department comments
- Timestamps (created/updated)

