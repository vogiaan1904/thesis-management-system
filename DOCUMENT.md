# Thesis Registration System Flow Documentation

## System Overview
A digital thesis management system where students apply for thesis topics, instructors approve/deny applications, and the department performs batch verification of credentials after the registration period.

---

## Phase 1: Registration and Approval Period (Week 0-2)

### 1A: STUDENT FLOW

#### Step 1A.1: Student System Access
**Description:** Students log into the thesis management system

**Process:**
- Student uses university credentials (Student ID + Password)
- System authenticates via university SSO or local database
- Student accesses thesis registration portal

**Edge Cases:**
- 🔴 Student not yet registered in EDUSoft but tries to access system
- 🔴 Student has multiple accounts (transfer student, changed major)
- 🔴 Concurrent login attempts from multiple devices
- 🔴 Password reset during registration period
- 🔴 Session timeout while filling registration form

---

#### Step 1A.2: Browse Available Topics
**Description:** Students view list of thesis topics with real-time availability

**Display Information:**
- Instructor name and contact email
- Topic title and description
- Required skills/prerequisites
- Current available slots (real-time, e.g., "2 slots available")
- Number of pending applications
- Research area/field

**Edge Cases:**
- 🔴 Slot count changes while student is viewing
- 🔴 Topic removed while student is browsing
- 🔴 Multiple students viewing same topic simultaneously
- 🔴 Instructor adds new requirements while students are browsing
- 🔴 Display shows available slots but all have pending applications

---

#### Step 1A.3: Submit Topic Application
**Description:** Students apply for a topic and submit required documents

**Required Submissions:**
- Select desired topic
- Upload EDUSoft credits screenshot/transcript
- Enter current total credits completed
- Write motivation letter (optional)
- Provide contact information
- Any additional documents required by instructor

**System Actions:**
- Creates registration record with status: `PENDING_INSTRUCTOR_REVIEW`
- Does NOT decrease available slots yet
- Sends notification to instructor
- Provides application ID to student

**Edge Cases:**
- 🔴 Student uploads corrupted/unreadable files
- 🔴 Student enters false credit information
- 🔴 File upload fails after form submission
- 🔴 Student submits multiple applications to same instructor
- 🔴 Student applies to more topics than allowed
- 🔴 Network failure during submission
- 🔴 Student edits application after submission

---

#### Step 1A.4: Email Instructor
**Description:** Students contact instructors directly to discuss the topic

**Process:**
- System provides instructor email
- Student sends email about experience and interest
- Discusses research approach and timeline
- This happens in parallel with system application

**Edge Cases:**
- 🔴 Student emails instructor but doesn't submit system application
- 🔴 Instructor responds positively in email but denies in system
- 🔴 Email goes to spam/wrong address
- 🔴 Student uses wrong email format/language
- 🔴 Multiple students email about same last slot

---

### 1B: INSTRUCTOR FLOW

#### Step 1B.1: View Student Applications
**Description:** Instructors access dashboard showing all applications for their topics

**Dashboard Shows:**
- List of pending applications
- Student details (name, ID, major)
- Submitted credits information
- Documents uploaded
- Timestamp of application
- Current slot availability for each topic

**Edge Cases:**
- 🔴 Too many applications to review in time
- 🔴 Dashboard not updating in real-time
- 🔴 Cannot view student documents due to format issues
- 🔴 Multiple instructors share same topic
- 🔴 Applications arrive just before deadline

---

#### Step 1B.2: Review Student Credentials
**Description:** Instructor reviews student-submitted information

**Review Process:**
- Check student's credits claim
- Review transcript/screenshot
- Read motivation letter
- Consider email communication
- Check prerequisites match

**Edge Cases:**
- 🔴 Credits shown in screenshot don't match entered value
- 🔴 Screenshot is edited/fraudulent
- 🔴 Student qualifications unclear from documents
- 🔴 Prerequisites met but student lacks practical skills
- 🔴 Cannot verify English proficiency requirement

---

#### Step 1B.3: Accept or Deny Application
**Description:** Instructor makes decision on each application

**ACCEPT Action:**
- Changes status to: `INSTRUCTOR_ACCEPTED`
- **Decreases available slots by 1**
- Sends acceptance email to student
- Application locked (cannot be changed)

**DENY Action:**
- Changes status to: `INSTRUCTOR_DENIED`
- Slots remain unchanged
- Sends rejection email with reason
- Student can apply to other topics

**Edge Cases:**
- 🔴 Instructor accepts more students than available slots
- 🔴 Accepts student then wants to revoke
- 🔴 Denies student then wants to accept later
- 🔴 Multiple instructors try to accept same student
- 🔴 System lag causes over-acceptance
- 🔴 Instructor absent/doesn't respond in time
- 🔴 Accidental accept/deny click

---

#### Step 1B.4: Manage Slot Availability
**Description:** System automatically updates slot counts based on instructor actions

**Automatic Updates:**
- Accept → Decrease slot by 1
- Deny → No change to slots
- Student withdraws accepted application → Increase slot by 1
- If slots = 0, topic marked as "FULL"

**Edge Cases:**
- 🔴 Race condition: Two instructors accept students for last slot
- 🔴 Slot count goes negative due to system error
- 🔴 Instructor wants to add more slots mid-process
- 🔴 Department overrides instructor's slot limit
- 🔴 System shows different slot count than instructor expects


---

## Phase 2: Verification Phase (After Week N)

### 2: DEPARTMENT FLOW

#### Step 2.1: Registration Period Closure
**Description:** System closes registration period after N weeks

**System Actions:**
- No new applications accepted
- Pending instructor reviews flagged for urgent action
- Generate report of all registrations
- Status snapshot created for audit

**Current Registration Statuses:**
- `INSTRUCTOR_ACCEPTED` - Student accepted by instructor
- `INSTRUCTOR_DENIED` - Student rejected by instructor  
- `PENDING_INSTRUCTOR_REVIEW` - No instructor decision yet

**Edge Cases:**
- 🔴 Instructor trying to accept student after deadline
- 🔴 Student with pending status but instructor claims they communicated outside system
- 🔴 System clock/timezone issues affecting closure time
- 🔴 Pending applications with no instructor action

---

#### Step 2.2: EDUSoft Data Export
**Description:** Department exports Excel file of enrolled students from EDUSoft

**Export Contains:**
- Student ID
- Student Name  
- Major/Program
- Enrolled in Thesis course (Yes/No)
- Actual credits completed
- English proficiency status
- Semester information

**Edge Cases:**
- 🔴 Export doesn't include late EDUSoft registrations
- 🔴 Export format changed from previous semester
- 🔴 Special characters in names cause export issues
- 🔴 Some students marked as "conditional" in EDUSoft
- 🔴 Credits showing differently than student's screenshot

---

#### Step 2.3: Excel Upload to System
**Description:** Department uploads Excel file for verification

**Process:**
- Department admin logs in with elevated privileges
- Uploads Excel file through web interface
- System validates file structure
- Creates backup of current data before processing

**Edge Cases:**
- 🔴 Multiple staff upload different versions
- 🔴 Upload during instructor acceptance actions
- 🔴 Partial upload due to file size
- 🔴 Wrong semester data uploaded
- 🔴 Network interruption during upload

---

#### Step 2.4: Automated Verification Process
**Description:** System verifies student eligibility against EDUSoft data

**Verification Logic:**
```
FOR each registration with INSTRUCTOR_ACCEPTED status:
  IF student_id EXISTS in Excel AND enrolled_in_thesis = TRUE:
    IF actual_credits >= required_credits:
      → Status = VERIFIED ✅
    ELSE:
      → Status = INVALID_CREDITS ❌
  ELSE:
    → Status = NOT_ENROLLED_EDUSOFT ❌
```

**Important:** Slots are NOT affected by verification (already decreased during instructor acceptance)

**Edge Cases:**
- 🔴 Student's actual credits less than self-reported
- 🔴 Student accepted by instructor but not in EDUSoft
- 🔴 Name mismatch between systems
- 🔴 Student dropped from EDUSoft after instructor acceptance
- 🔴 Credits calculation differs between systems

---

#### Step 2.5: Invalid Registration Highlighting
**Description:** Department dashboard highlights all invalid registrations

**Dashboard Display:**
- ❌ **INVALID_CREDITS**: Students with insufficient credits (Red)
- ❌ **NOT_ENROLLED_EDUSOFT**: Students not in thesis course (Orange)
- ⚠️ **PENDING_INSTRUCTOR_REVIEW**: No instructor decision (Yellow)
- ✅ **VERIFIED**: All checks passed (Green)

**Shows for each invalid:**
- Student name and ID
- Instructor and topic
- Reason for invalidity
- Contact information
- Self-reported vs actual credits

**Edge Cases:**
- 🔴 Too many invalid registrations to handle manually
- 🔴 Same student appears invalid for multiple reasons
- 🔴 Display doesn't refresh after manual updates
- 🔴 Export function fails with large datasets

---

#### Step 2.6: Manual Intervention
**Description:** Department handles invalid registrations

**Actions Available:**
- **Override**: Manually approve despite failing checks (with reason)
- **Revoke**: Cancel student's registration and notify parties
- **Request Documents**: Ask student for additional proof
- **Defer**: Move student to next semester

**Process for Revocation:**
- Department selects invalid registration
- Enters reason for revocation
- System changes status to `DEPARTMENT_REVOKED`
- **Slot is restored** to instructor's topic
- Notifications sent to student and instructor

**Edge Cases:**
- 🔴 Instructor objects to department revocation
- 🔴 Student appeals revocation decision
- 🔴 Slot already filled by instructor after revocation
- 🔴 Legal/academic policy conflicts
- 🔴 Override creates inconsistency in records

---

#### Step 2.7: Notification Management
**Description:** System sends notifications based on verification results

**Notification Types:**
1. **To Verified Students**: Confirmation and next steps
2. **To Invalid Students**: Reason and required actions
3. **To Instructors**: Final verified student list
4. **To Department**: Summary report and exceptions

**Edge Cases:**
- 🔴 Notification sent but status changed afterwards
- 🔴 Email bounces for invalid addresses
- 🔴 Student claims they never received notification
- 🔴 Bulk notifications flagged as spam
- 🔴 Instructor notification missing students

---

## Status Flow Diagram

```
Application Submitted
        ↓
[PENDING_INSTRUCTOR_REVIEW]
        ↓
    ┌───┴───┐
    ↓       ↓
[ACCEPTED] [DENIED]
    ↓
[INSTRUCTOR_ACCEPTED]
    ↓
After Excel Upload
    ↓
    ┌────┬────┬────┐
    ↓    ↓    ↓    ↓
[VERIFIED] [INVALID_CREDITS] [NOT_ENROLLED_EDUSOFT] [DEPARTMENT_REVOKED]
```

---

## Slot Management Rules

### When Slots Decrease:
1. ✅ Instructor accepts student application → -1 slot
2. ❌ Student submits application → No change
3. ❌ Department verification → No change

### When Slots Increase:
1. ✅ Accepted student withdraws → +1 slot
2. ✅ Department revokes accepted student → +1 slot
3. ✅ Instructor increases topic capacity → +n slots

### Slot Integrity:
- Slots can never go negative
- Full topics reject new applications automatically
- Real-time slot count visible to all users
- Audit log for all slot changes

---

## Critical System-Wide Edge Cases

### Data Integrity Issues
- 🔴 Student accepted for multiple topics simultaneously
- 🔴 Orphaned registrations (no instructor or topic)
- 🔴 Slot count mismatch between database and display
- 🔴 Verification changes previously accepted status

### Timing and Concurrency
- 🔴 Instructor accepting during department verification
- 🔴 Multiple administrators processing same student
- 🔴 Race conditions in slot management
- 🔴 Deadline enforcement across different timezones

### Authority Conflicts
- 🔴 Instructor accepts but department wants to revoke
- 🔴 Student meets instructor requirements but not department requirements
- 🔴 Override authority unclear between roles
- 🔴 External pressure to accept/reject students

### System Failures
- 🔴 Backup restore causes status regression
- 🔴 Partial transaction commits
- 🔴 Cache shows outdated information
- 🔴 Audit trail incomplete or corrupted

---

## Recovery and Rollback Procedures

1. **Before Excel Upload**: Create complete backup
2. **Verification Rollback**: Ability to undo batch verification
3. **Individual Corrections**: Manual status adjustment with audit
4. **Slot Reconciliation**: Tool to recalculate correct slot counts
5. **Notification Retry**: Resend failed notifications
6. **History Tracking**: Complete audit of all status changes

---

## Key Differences from Original Flow

| Aspect | Original Flow | Modified Flow |
|--------|--------------|---------------|
| **Slot Management** | After verification | During instructor accept/deny |
| **Student Data** | Wait for EDUSoft | Self-report with documents |
| **Instructor Role** | Passive recipient | Active approver/denier |
| **Verification Purpose** | Assign slots | Validate credentials only |
| **Invalid Handling** | Automatic cancellation | Manual department review |

---

## Success Metrics

- **Instructor Metrics:**
  - Response time to applications
  - Acceptance rate
  - Slot utilization

- **Student Metrics:**
  - Application to acceptance rate
  - Document submission completeness
  - Verification pass rate

- **Department Metrics:**
  - Invalid registration percentage
  - Manual intervention count
  - Processing time after deadline

- **System Metrics:**
  - Concurrent user handling
  - Notification delivery rate
  - Data consistency errors

---

## Implementation Priorities

### Phase 1 (Critical):
1. Instructor accept/deny interface
2. Real-time slot management
3. Student document upload
4. Basic notification system

### Phase 2 (Important):
1. Excel upload and parsing
2. Automated verification
3. Department override tools
4. Comprehensive audit trail

### Phase 3 (Enhancement):
1. Waitlist management
2. Advanced analytics
3. Mobile app support
4. API for EDUSoft integration

---

## Notes for Further Discussion

1. **Maximum Applications**: Should students be limited in how many topics they can apply to?
2. **Waiting Period**: Should there be a cooling period after instructor denial?
3. **Document Verification**: Should system attempt OCR on transcripts?
4. **Slot Trading**: Can accepted students switch topics with each other?
5. **Prerequisite Automation**: Can system check prerequisites automatically?
6. **Backup Instructors**: What if instructor becomes unavailable after accepting students?
7. **Appeal Process**: Formal workflow for student appeals?
8. **Cross-Department**: Can students apply to other department topics?