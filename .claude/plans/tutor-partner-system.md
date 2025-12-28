# Tutor Partner System - Implementation Plan

## Overview
A comprehensive tutor marketplace system that enables qualified tutors to register, get approved, provide 1-on-1 tutoring sessions, and grade student assignments for courses they're proficient in.

## Requirements Summary
Based on user requirements:
- **File uploads**: Any document (PDF, DOC, DOCX, JPG, PNG), max 25MB
- **Timezone**: Auto-convert tutor availability to student's local time
- **Meeting**: Auto-generate Google Meet links
- **Payment**: Track sessions only (payment handled externally)

---

## Phase 1: Database Schema

### New Prisma Models

```prisma
// New role to add to UserRole enum
enum UserRole {
  STUDENT
  CENTER_ADMIN
  TABSERA_ADMIN
  TUTOR  // NEW
}

enum TutorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model TutorProfile {
  id              String       @id @default(uuid())
  userId          String       @unique
  user            User         @relation(fields: [userId], references: [id])
  bio             String?      @db.Text
  headline        String?      // e.g., "Mathematics Expert | 10+ years experience"
  status          TutorStatus  @default(PENDING)
  approvedAt      DateTime?
  approvedBy      String?
  rejectionReason String?
  timezone        String       @default("UTC")
  hourlyRate      Decimal?     @db.Decimal(10, 2)
  totalSessions   Int          @default(0)
  avgRating       Decimal?     @db.Decimal(3, 2)

  certifications  TutorCertification[]
  courses         TutorCourse[]
  availability    TutorAvailability[]
  sessions        TutorSession[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model TutorCertification {
  id              String       @id @default(uuid())
  tutorProfileId  String
  tutorProfile    TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)
  title           String       // e.g., "Bachelor of Education"
  institution     String       // e.g., "University of Nairobi"
  fileUrl         String       // S3/local storage URL
  fileName        String
  fileSize        Int          // bytes
  fileType        String       // mime type
  verified        Boolean      @default(false)
  verifiedAt      DateTime?
  verifiedBy      String?

  createdAt       DateTime     @default(now())
}

model TutorCourse {
  id              String       @id @default(uuid())
  tutorProfileId  String
  tutorProfile    TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)
  courseId        String
  course          Course       @relation(fields: [courseId], references: [id])
  edxStaffEnrolled Boolean     @default(false)
  edxEnrolledAt   DateTime?
  canGrade        Boolean      @default(false)

  createdAt       DateTime     @default(now())

  @@unique([tutorProfileId, courseId])
}

model TutorAvailability {
  id              String       @id @default(uuid())
  tutorProfileId  String
  tutorProfile    TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)
  dayOfWeek       Int          // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime       String       // "09:00" in tutor's timezone
  endTime         String       // "17:00" in tutor's timezone
  isActive        Boolean      @default(true)

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([tutorProfileId, dayOfWeek, startTime])
}

model TuitionPack {
  id              String       @id @default(uuid())
  name            String       // e.g., "10 Session Pack"
  description     String?
  sessionCount    Int          // Number of 10-minute sessions
  sessionDuration Int          @default(10) // minutes per session
  price           Decimal      @db.Decimal(10, 2)
  isActive        Boolean      @default(true)

  purchases       TuitionPackPurchase[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model TuitionPackPurchase {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  tuitionPackId   String
  tuitionPack     TuitionPack  @relation(fields: [tuitionPackId], references: [id])
  orderId         String?
  order           Order?       @relation(fields: [orderId], references: [id])
  sessionsTotal   Int          // Total sessions purchased
  sessionsUsed    Int          @default(0)
  sessionsRemaining Int        // Computed: sessionsTotal - sessionsUsed
  expiresAt       DateTime?    // Optional expiration

  sessions        TutorSession[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model TutorSession {
  id              String        @id @default(uuid())
  tutorProfileId  String
  tutorProfile    TutorProfile  @relation(fields: [tutorProfileId], references: [id])
  studentId       String
  student         User          @relation("StudentSessions", fields: [studentId], references: [id])
  purchaseId      String?
  purchase        TuitionPackPurchase? @relation(fields: [purchaseId], references: [id])
  courseId        String?       // Optional: specific course focus
  course          Course?       @relation(fields: [courseId], references: [id])

  scheduledAt     DateTime      // Session start time (UTC)
  duration        Int           @default(10) // minutes
  status          SessionStatus @default(SCHEDULED)

  meetingUrl      String?       // Google Meet URL
  meetingId       String?       // Google Meet ID

  topic           String?       // What student wants to discuss
  tutorNotes      String?       @db.Text
  studentNotes    String?       @db.Text
  rating          Int?          // 1-5 rating by student
  feedback        String?       @db.Text

  startedAt       DateTime?
  endedAt         DateTime?
  cancelledAt     DateTime?
  cancelledBy     String?       // 'tutor' or 'student'
  cancellationReason String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

### Update Existing Models

```prisma
// Add to User model
model User {
  // ... existing fields
  tutorProfile      TutorProfile?
  tuitionPurchases  TuitionPackPurchase[]
  studentSessions   TutorSession[] @relation("StudentSessions")
}

// Add to Course model
model Course {
  // ... existing fields
  tutorCourses      TutorCourse[]
  tutorSessions     TutorSession[]
}

// Add to Order model (for tuition pack purchases)
model Order {
  // ... existing fields
  tuitionPurchases  TuitionPackPurchase[]
}
```

---

## Phase 2: Backend API Routes

### File: `server/src/routes/tutors.js`

```
POST   /api/tutors/register          - Tutor registration with profile
POST   /api/tutors/certifications    - Upload certification document
DELETE /api/tutors/certifications/:id - Remove certification
GET    /api/tutors/profile           - Get own tutor profile
PUT    /api/tutors/profile           - Update tutor profile
GET    /api/tutors/courses           - Get tutor's assigned courses
POST   /api/tutors/availability      - Set availability slots
GET    /api/tutors/availability      - Get own availability
GET    /api/tutors/sessions          - Get tutor's sessions
PUT    /api/tutors/sessions/:id      - Update session (notes, complete)
GET    /api/tutors/assignments       - Get pending assignments to grade
POST   /api/tutors/assignments/:id/grade - Submit grade for assignment
```

### File: `server/src/routes/admin/tutors.js`

```
GET    /api/admin/tutors             - List all tutor applications
GET    /api/admin/tutors/:id         - Get tutor details
POST   /api/admin/tutors/:id/approve - Approve tutor (enrolls as staff in edX)
POST   /api/admin/tutors/:id/reject  - Reject tutor application
POST   /api/admin/tutors/:id/suspend - Suspend active tutor
GET    /api/admin/tutors/:id/courses - Get tutor's courses
POST   /api/admin/tutors/:id/courses - Assign courses to tutor
DELETE /api/admin/tutors/:id/courses/:courseId - Remove course
```

### File: `server/src/routes/tuition.js`

```
GET    /api/tuition/packs            - List available tuition packs
GET    /api/tuition/balance          - Get student's session balance
GET    /api/tuition/tutors           - List approved tutors (with filters)
GET    /api/tuition/tutors/:id       - Get tutor details & availability
GET    /api/tuition/tutors/:id/slots - Get available time slots
POST   /api/tuition/sessions/book    - Book a session
GET    /api/tuition/sessions         - Get student's sessions
PUT    /api/tuition/sessions/:id/cancel - Cancel a session
POST   /api/tuition/sessions/:id/rate - Rate completed session
```

---

## Phase 3: edX Staff Enrollment Integration

### File: `server/src/services/edx.js` (additions)

```javascript
/**
 * Enroll user as staff/instructor in a course
 * Uses edX Course Team API
 */
const enrollAsStaff = async (email, courseId) => {
  // POST to /api/courses/v1/courses/{course_id}/team
  // with role: "staff" or "instructor"
};

/**
 * Get pending assignments for grading
 * Uses edX Submissions API
 */
const getPendingSubmissions = async (courseId, staffUsername) => {
  // GET /api/submissions/v1/submissions/?course_id={course_id}&status=pending
};

/**
 * Submit grade for an assignment
 */
const submitGrade = async (submissionId, grade, feedback) => {
  // POST /api/submissions/v1/submissions/{submission_id}/score
};
```

---

## Phase 4: Google Meet Integration

### File: `server/src/services/googleMeet.js`

```javascript
const { google } = require('googleapis');

// Uses Google Calendar API to create Meet events
const createMeetSession = async (tutorEmail, studentEmail, scheduledAt, duration, topic) => {
  // 1. Authenticate with service account
  // 2. Create calendar event with conferenceData
  // 3. Return { meetingUrl, meetingId, calendarEventId }
};

const cancelMeetSession = async (calendarEventId) => {
  // Delete the calendar event
};
```

### Environment Variables
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_SERVICE_ACCOUNT_KEY=  # Base64 encoded JSON key
```

---

## Phase 5: Frontend Pages

### Tutor Portal (`/tutor/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/tutor/register` | TutorRegistration.jsx | Multi-step registration form |
| `/tutor/dashboard` | TutorDashboard.jsx | Overview, upcoming sessions, stats |
| `/tutor/profile` | TutorProfile.jsx | Edit bio, certifications, availability |
| `/tutor/sessions` | TutorSessions.jsx | List of upcoming/past sessions |
| `/tutor/sessions/:id` | TutorSessionDetail.jsx | Session details, notes, Meet link |
| `/tutor/assignments` | TutorAssignments.jsx | Pending assignments to grade |
| `/tutor/assignments/:id` | AssignmentGrading.jsx | Grade interface |

### Admin Pages (additions)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/tutors` | TutorManagement.jsx | List tutors, filter by status |
| `/admin/tutors/:id` | TutorDetails.jsx | Review application, approve/reject |
| `/admin/tuition-packs` | TuitionPackManagement.jsx | CRUD for tuition packs |

### Student Pages (additions)

| Route | Component | Description |
|-------|-----------|-------------|
| `/student/tutoring` | TutoringHub.jsx | Browse tutors, book sessions |
| `/student/tutoring/tutors/:id` | TutorBooking.jsx | View tutor, select slot, book |
| `/student/tutoring/sessions` | MySessions.jsx | Upcoming/past sessions |
| `/student/tutoring/sessions/:id` | SessionDetail.jsx | Join session, rate after |

### Checkout Integration

Add `TuitionPack` as a purchasable product type:
- Update CartContext to handle tuition packs
- Update Checkout flow to process tuition pack purchases
- Create TuitionPackPurchase record on successful order

---

## Phase 6: File Upload System

### File: `server/src/routes/uploads.js`

```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for 25MB max, document types only
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/certifications/',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/certifications', authenticate, upload.single('file'), async (req, res) => {
  // Save to TutorCertification table
});
```

---

## Phase 7: Timezone Handling

### Approach
1. Store tutor's timezone in TutorProfile (e.g., "Africa/Nairobi")
2. Store all session times in UTC in database
3. Convert to local time in API responses based on requesting user's timezone
4. Frontend detects user's timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`

### File: `server/src/utils/timezone.js`

```javascript
const { DateTime } = require('luxon');

const convertToUTC = (localTime, timezone) => {
  return DateTime.fromISO(localTime, { zone: timezone }).toUTC().toISO();
};

const convertFromUTC = (utcTime, timezone) => {
  return DateTime.fromISO(utcTime, { zone: 'UTC' }).setZone(timezone).toISO();
};

const getAvailableSlots = (availability, timezone, targetTimezone, date) => {
  // Convert tutor's availability to student's timezone for display
};
```

---

## Implementation Order

### Sprint 1: Foundation
1. Add Prisma schema changes, run migration
2. Create TutorProfile, TutorCertification models
3. Implement file upload for certifications
4. Create tutor registration page with multi-step form
5. Create admin tutor management page (list, view details)

### Sprint 2: Approval & edX Integration
1. Implement admin approval workflow
2. Add edX staff enrollment on approval
3. Create TutorCourse model and assignment
4. Build tutor dashboard with approved courses

### Sprint 3: Assignments & Grading
1. Integrate edX Submissions API
2. Create tutor assignments page
3. Build grading interface
4. Test end-to-end grading flow

### Sprint 4: Tuition Packs & Booking
1. Create TuitionPack, TuitionPackPurchase models
2. Add tuition packs to checkout flow
3. Build tutor availability management
4. Create student booking interface

### Sprint 5: Sessions & Google Meet
1. Set up Google API credentials
2. Implement Meet session creation
3. Build session management for tutors
4. Create student session view with Meet join

### Sprint 6: Polish & Testing
1. Add session reminders (email)
2. Implement session rating/feedback
3. Add tutor search/filter
4. End-to-end testing

---

## API Authentication Notes

- Tutor routes require `authenticate` middleware + role check for `TUTOR`
- Admin tutor routes require `TABSERA_ADMIN` role
- Student tuition routes require `STUDENT` role
- File uploads are secured to authenticated users only

---

## Database Indexes

```prisma
@@index([tutorProfileId, status])  // TutorSession - for tutor's sessions
@@index([studentId, status])        // TutorSession - for student's sessions
@@index([scheduledAt])              // TutorSession - for date queries
@@index([status])                   // TutorProfile - for admin filters
@@index([userId, sessionsRemaining]) // TuitionPackPurchase - for balance check
```
