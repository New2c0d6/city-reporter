# City Reporter — MVP

## 1. Product Goal

City Reporter is a mobile-first web application that allows citizens to report visible civic issues with evidence and location.

An internal team can then review, manage, and resolve those reports.

### Core workflow

Citizen

→ Create Report

→ Add Evidence + Location

→ Submit

→ Internal Team Reviews

→ Team Acts

→ Resolve

→ Close

The MVP should make this workflow work reliably before adding any secondary features.

---

# 2. MVP Scope

## Citizen

The citizen can:

* Select issue category
* Enter title
* Enter description
* Add photos
* Add a video
* Capture current location
* Review the report
* Submit the report
* See submission confirmation

Initial categories:

* Infrastructure
* Illegal Dumping

The category model should allow additional categories later.

---

## Internal Team

An authenticated internal user can:

* Sign in
* View reports
* Search reports
* Filter reports
* Open report details
* View photos/videos
* View report location
* Change report status
* View status history

The dashboard should use a simple Kanban-style workflow where appropriate.

---

# 3. Report Model

A report contains:

### Issue

* Reference number
* Category
* Title
* Description
* Priority
* Status

### Evidence

* Photos
* Videos

### Location

* Latitude
* Longitude
* Accuracy
* Timestamp
* Address when available

Coordinates are the primary source of truth.

### Reporter

Only store information required by the MVP.

### Workflow

* Current status
* Status history
* Who changed the status
* When it changed

---

# 4. Status Workflow

Use exactly this initial workflow:

NEW
→ IN_REVIEW
→ IN_PROGRESS
→ RESOLVED
→ CLOSED

Status transitions must be explicit.

Do not create a generic workflow engine.

---

# 5. MVP Non-Goals

Do NOT implement these during the MVP:

* Comments
* Chat
* Notifications
* Email/SMS
* Public voting
* Assignments
* Team management
* Advanced permissions
* AI classification
* AI image analysis
* Analytics
* Heatmaps
* Government API integrations
* Automatic municipality routing
* SLA management
* Gamification
* Native mobile applications
* Full Jira functionality

If a feature is not required for the core workflow, defer it.

---

# 6. Technical Direction

Preferred stack:

* TypeScript
* React Native 
* Node
* PostgreSQL
* Object storage for media
* Authentication
* Responsive web UI

The agent must propose the exact libraries and architecture before implementing the corresponding part.

Do not introduce infrastructure that is unnecessary for the MVP.

---

# 7. Development Phases

Development must happen sequentially.

## Phase 0 — Planning

Goal:

Understand the project and produce the implementation plan.

Tasks:

* Inspect repository
* Inspect existing code
* Identify current dependencies
* Propose architecture
* Propose database schema
* Propose application structure
* Identify required external services
* Identify major risks
* Create/update `TODO.md`

### Output

No significant feature implementation.

Wait for approval before starting Phase 1.

---

# Phase 1 — Application Foundation

Goal:

Create the minimum working application foundation.

Tasks:

* Next.js/React setup if required
* TypeScript configuration
* Environment configuration
* Base application structure
* Database connection
* Basic UI primitives
* Basic error handling
* Basic development scripts

### Definition of done

Application starts successfully and the basic architecture is established.

---

# Phase 2 — Database + Report Creation

Goal:

A citizen can create a basic report.

Tasks:

* Report schema
* Category model
* Report creation API/server action
* Validation
* Citizen report form
* Submission state
* Success state
* Error state

At the end of this phase:

> A user can create a report without media/location.

---

# Phase 3 — Location

Goal:

Attach reliable location data to a report.

Tasks:

* Browser geolocation
* Latitude
* Longitude
* Accuracy
* Capture timestamp
* Permission-denied handling
* Timeout handling
* Retry
* Optional address resolution

At the end of this phase:

> A report can be submitted with location.

---

# Phase 4 — Media

Goal:

Allow citizens to attach evidence.

Tasks:

* Photo upload
* Video upload
* File validation
* Size validation
* Preview
* Remove
* Upload progress
* Upload failure handling
* Retry

At the end of this phase:

> A citizen can submit a report with evidence and location.

---

# Phase 5 — Internal Authentication

Goal:

Protect the internal dashboard.

Tasks:

* Authentication
* Protected routes
* Server-side authorization
* Basic internal-user model if required
* Unauthorized state

At the end of this phase:

> Only authenticated internal users can access report management.

---

# Phase 6 — Internal Dashboard

Goal:

Internal users can manage reports.

Tasks:

* Dashboard
* Report list
* Kanban/status grouping
* Search
* Basic filters
* Report cards
* Report detail page
* Media viewer
* Location/map

At the end of this phase:

> Internal users can find and inspect submitted reports.

---

# Phase 7 — Workflow

Goal:

Internal users can move reports through the workflow.

Tasks:

* Status transitions
* Transition validation
* Status history
* Actor tracking
* Timestamp tracking
* UI for changing status

At the end of this phase:

> A report can move from NEW to CLOSED.

---

# Phase 8 — MVP Hardening

Goal:

Make the core workflow reliable.

Tasks:

* Form validation review
* Error states
* Loading states
* Empty states
* Mobile review
* Accessibility review
* Authorization review
* Upload security review
* Performance review
* Automated tests
* Typecheck
* Lint
* Production build

---

# 8. Task Execution Rules

The project must be implemented task-by-task.

The agent must NOT attempt an entire phase in one operation.

Each task should:

1. Have a clear objective.
2. Have a small scope.
3. Have a definition of done.
4. Be independently testable where possible.
5. Update `TODO.md`.
6. Run relevant validation.
7. Stop after completing the task.

Example:

```text
TASK-012
Create report database model

Scope:
- Create Report table
- Create Category relation
- Add status field
- Add timestamps

Done when:
- Migration succeeds
- TypeScript types compile
- Database schema is verified

Not included:
- API
- UI
- Authentication
```

---

# 9. Definition of Done

A task is complete only when:

* Implementation is complete
* Types pass
* Relevant tests pass
* Lint passes where applicable
* Error handling exists
* No unrelated features were added
* `TODO.md` is updated

The MVP is complete when:

> A citizen can report a real city issue from a phone with evidence and location, and an authenticated internal user can receive, review, manage, and close that report.

---

# 10. Change Control

If a requested change:

* Expands MVP scope
* Changes database architecture
* Changes authentication
* Introduces a new external service
* Requires significant refactoring

The agent must stop and explain the impact before implementing it.

Do not silently expand the project.

---

# 11. Product Principle

## Build the smallest complete workflow first.

Do not optimize for number of features.

Optimize for:

* Reliability
* Simplicity
* Mobile usability
* Clear UX
* Maintainable code
* Security
* A complete end-to-end workflow
