# Thesis Registration System - Backend

NestJS backend for a university thesis registration system where students apply for thesis topics, instructors approve/deny applications, and the department performs batch verification against EDUSoft data.

## Technology Stack

- **Framework**: NestJS v10.4 (latest stable v10)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Queue**: Bull (Redis-based)
- **WebSocket**: Socket.io
- **Email**: Nodemailer with Handlebars templates
- **File Processing**: ExcelJS for verification

## Prerequisites

- Node.js v18.19.0 LTS or higher
- PostgreSQL 15+
- Redis 7+ (for Bull queue)
- npm or yarn

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Then edit `.env` with your configuration:
- Database connection string
- JWT secrets
- Email configuration (SMTP)
- Redis connection
- Registration period dates

3. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

4. **Run database migrations**:
```bash
npm run prisma:migrate
```

5. **Seed the database** (optional):
```bash
npm run prisma:seed
```

## Running the Application

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Database seeding script
├── src/
│   ├── common/                 # Shared resources
│   │   ├── constants/          # Status enums and constants
│   │   ├── decorators/         # Custom decorators
│   │   ├── dto/                # Common DTOs
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   └── interceptors/       # Response interceptors
│   ├── config/                 # Configuration files
│   │   ├── app.config.ts
│   │   ├── jwt.config.ts
│   │   └── database.config.ts
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication & Authorization
│   │   ├── topics/             # Topic management
│   │   ├── registrations/      # Application management
│   │   ├── verification/       # Excel verification
│   │   ├── notifications/      # Email notifications
│   │   └── reports/            # Reports and statistics
│   ├── prisma/                 # Prisma service
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── test/                       # Test files
├── uploads/                    # Uploaded files
└── .env                        # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile

### Topics
- `GET /api/topics` - List all topics (with filters)
- `GET /api/topics/:id` - Get topic details
- `POST /api/topics` - Create topic (Instructor only)
- `PATCH /api/topics/:id` - Update topic (Own topics only)
- `DELETE /api/topics/:id` - Delete topic (Own topics only)
- `GET /api/topics/my-topics` - Get instructor's topics

### Registrations
- `POST /api/registrations/apply` - Apply for a topic (Student)
- `GET /api/registrations/my-applications` - Get student's applications
- `PATCH /api/registrations/:id` - Update application
- `DELETE /api/registrations/:id` - Withdraw application
- `GET /api/registrations/pending-reviews` - Get pending reviews (Instructor)
- `POST /api/registrations/review` - Review application (Instructor)
- `GET /api/registrations/my-students` - Get accepted students (Instructor)
- `GET /api/registrations` - Get all registrations (Department/Admin)

### Verification
- `POST /api/verification/upload` - Upload Excel for verification (Department/Admin)
- `GET /api/verification/history` - Get verification history
- `GET /api/verification/latest` - Get latest verification
- `POST /api/verification/process/:batchId` - Re-process verification

### Reports
- `GET /api/reports/summary` - Overall system summary
- `GET /api/reports/instructor-load` - Instructor workload report
- `GET /api/reports/department-stats` - Department statistics
- `GET /api/reports/export` - Export data to Excel

## WebSocket Events

### Namespace: `/registrations`

**Client → Server:**
- `subscribe-topic` - Subscribe to topic updates
- `unsubscribe-topic` - Unsubscribe from topic

**Server → Client:**
- `slots-update` - Topic slot availability changed
- `student-{studentId}` - Student-specific notifications
- `instructor-{instructorId}` - Instructor-specific notifications

## Database Schema

See `prisma/schema.prisma` for the complete database schema. Main models:

- **User** - Students, Instructors, Department staff, Admins
- **Topic** - Thesis topics with details and requirements
- **Registration** - Student applications with status tracking
- **VerificationBatch** - Excel verification batches

## Registration Status Flow

1. `PENDING_INSTRUCTOR_REVIEW` - Initial application
2. `INSTRUCTOR_ACCEPTED` - Approved by instructor
3. `INSTRUCTOR_DENIED` - Rejected by instructor
4. `VERIFIED` - Verified by department (credits match)
5. `INVALID_CREDITS` - Credits don't match EDUSoft
6. `NOT_ENROLLED_EDUSOFT` - Student not enrolled
7. `DEPARTMENT_REVOKED` - Manually revoked

## Default Credentials (after seeding)

**Admin:**
- User ID: `ADMIN001`
- Email: `admin@university.edu.vn`
- Password: `admin123`

**Instructor:**
- User ID: `INST001`
- Email: `instructor@university.edu.vn`
- Password: `instructor123`

## Environment Variables

See `.env.example` for all required environment variables:

- **Application**: PORT, API_PREFIX, CORS_ORIGIN
- **Database**: DATABASE_URL (PostgreSQL)
- **Redis**: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- **JWT**: JWT_SECRET, JWT_EXPIRATION
- **Email**: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD
- **Registration Period**: REGISTRATION_START_DATE, REGISTRATION_END_DATE
- **System Limits**: MAX_APPLICATIONS_PER_STUDENT, MAX_STUDENTS_PER_INSTRUCTOR

## Development Notes

1. **Prisma Studio**: Use `npm run prisma:studio` to open a GUI for database management
2. **WebSocket Testing**: Use a Socket.io client to test real-time features
3. **Email Testing**: Use a service like Mailtrap for testing emails in development
4. **Redis**: Required for Bull queue (verification processing)
5. **File Uploads**: Stored in `uploads/` directory (configure in .env)

## Deployment

### Using Docker Compose

A `docker-compose.yml` file is included for easy deployment with PostgreSQL and Redis:

```bash
docker-compose up -d
```

### Manual Deployment

1. Set up PostgreSQL and Redis
2. Set environment variables
3. Run migrations: `npm run prisma:migrate deploy`
4. Build: `npm run build`
5. Start: `npm run start:prod`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Troubleshooting

### Prisma Client not found
```bash
npm run prisma:generate
```

### Database connection errors
Check DATABASE_URL in .env and ensure PostgreSQL is running

### Redis connection errors
Check REDIS_HOST and REDIS_PORT in .env and ensure Redis is running

### WebSocket connection issues
Check CORS_ORIGIN in .env matches your frontend URL

## License

UNLICENSED - Private university project

## Support

For issues or questions, contact the development team or create an issue in the repository.
