# Always update this CLAUDE.md file to be up-to-date with the context


# Theme
- The theme color should be plum red #7C2946 (all the buttons, ... will be this color, maybe the status of the application can be red, blue, green, yellow,...). and the main background is still white


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

