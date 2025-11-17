# Thesis Management System

A comprehensive digital thesis management system with role-based interfaces for students, instructors, and department administrators.

## Features

### Student Portal
- Browse available thesis topics with real-time slot availability
- Submit applications with document uploads
- Track application status
- View instructor feedback

### Instructor Portal
- View and manage thesis topics
- Review student applications
- Accept or deny applications (automatically manages slot availability)
- Add notes and feedback for students

### Department Admin Portal
- Upload EDUSoft Excel data for verification
- Run batch verification of student credentials
- View all registrations with status breakdown
- Revoke invalid registrations
- Dashboard with comprehensive statistics

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Login

The application includes mock data for demonstration. Use the quick login buttons on the login page to access:

**Students:**
- Alice Johnson (alice.johnson@university.edu)
- Bob Smith (bob.smith@university.edu)
- Carol Williams (carol.williams@university.edu)

**Instructors:**
- Dr. Michael Chen (michael.chen@university.edu)
- Dr. Sarah Brown (sarah.brown@university.edu)
- Dr. James Wilson (james.wilson@university.edu)

**Administrators:**
- Admin User (admin@university.edu)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Layout, Button, Modal, etc.)
│   ├── student/         # Student-specific components
│   ├── instructor/      # Instructor-specific components
│   └── admin/           # Admin-specific components
├── pages/               # Page components
│   ├── student/         # Student pages
│   ├── instructor/      # Instructor pages
│   └── admin/           # Admin pages
├── services/            # API services and mock data
├── contexts/            # React contexts (Auth)
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## Registration Flow

1. **Student Application** (Week 0-2)
   - Students browse topics and submit applications
   - Upload transcript and self-report credits
   - Status: `PENDING_INSTRUCTOR_REVIEW`

2. **Instructor Review** (Week 0-2)
   - Instructors review applications
   - Accept → Status: `INSTRUCTOR_ACCEPTED`, slot reserved
   - Deny → Status: `INSTRUCTOR_DENIED`

3. **Department Verification** (After Week 2)
   - Upload EDUSoft Excel file
   - Run automated verification
   - Status changes to:
     - `VERIFIED` - All checks passed
     - `INVALID_CREDITS` - Credits mismatch
     - `NOT_ENROLLED_EDUSOFT` - Not in thesis course
   - Manual intervention for invalid cases

## Status Types

- `PENDING_INSTRUCTOR_REVIEW` - Awaiting instructor decision
- `INSTRUCTOR_ACCEPTED` - Accepted by instructor
- `INSTRUCTOR_DENIED` - Denied by instructor
- `VERIFIED` - Department verified
- `INVALID_CREDITS` - Credits verification failed
- `NOT_ENROLLED_EDUSOFT` - Not enrolled in EDUSoft
- `DEPARTMENT_REVOKED` - Revoked by department

## Development Notes

- Mock data is used for demonstration (see `src/services/mockData.ts`)
- API services simulate network delays
- In-memory state management for demo purposes
- Ready for backend integration via `src/services/api.ts`

## Future Enhancements

- Real backend API integration
- File upload with cloud storage
- Email notifications
- Advanced filtering and search
- Export reports to PDF/Excel
- Audit trail logging
- Mobile responsive improvements
- Real-time updates with WebSockets
