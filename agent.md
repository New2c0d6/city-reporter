# AGENTS.md

# City Reporter — Agent Instructions

## 1. Primary Objective

Build City Reporter incrementally according to `PROJECT.md`.

The immediate goal is an MVP mobile application built with React Native.

Do not attempt to build the complete product in one session.

The agent must prioritize:

1. Correctness
2. Small changes
3. Clear architecture
4. Security
5. Mobile UX
6. Tests
7. Performance

---

# 2. Technology Stack

The application is a React Native mobile app.

### Core

* React Native
* TypeScript
* JavaScript/TypeScript
* React Navigation
* Functional components
* React Hooks

### Target Platforms

* Android
* iOS

The MVP should prioritize Android compatibility while keeping the implementation cross-platform.

### Architecture

Prefer:

```text
Feature-oriented structure
        ↓
Screens
        ↓
Components
        ↓
Hooks
        ↓
Services / API
        ↓
Backend
```

Keep platform-specific code isolated when necessary.

Use:

```text
Platform.OS
*.android.tsx
*.ios.tsx
```

only when a genuine platform difference exists.

Do not create separate implementations unnecessarily.

---

# 3. Source of Truth

Before making implementation decisions:

1. Read `PROJECT.md`.
2. Read the current `TODO.md`.
3. Inspect the existing code relevant to the current task.
4. Read only the relevant skill/reference material.

Do not repeatedly load large files when the required information is already known.

---

# 4. Task-Driven Development

All implementation must be driven by `TODO.md`.

The agent should work on ONE task at a time.

Never implement multiple unrelated tasks in a single turn.

### Task lifecycle

```text
TODO
 ↓
IN_PROGRESS
 ↓
IMPLEMENTED
 ↓
VALIDATED
 ↓
DONE
```

A task must not be marked DONE until validation succeeds.

---

# 5. TODO.md

`TODO.md` is the project's execution queue.

Each task should contain:

```text
## TASK-001 — Short description

Status: TODO
Phase: 1

Goal:
...

Scope:
- ...
- ...

Definition of Done:
- ...
- ...

Dependencies:
- ...

Notes:
...
```

When starting a task:

```text
Status: IN_PROGRESS
```

When implementation is complete:

```text
Status: IMPLEMENTED
```

After validation:

```text
Status: DONE
```

If blocked:

```text
Status: BLOCKED
```

Explain why it is blocked.

---

# 6. Task Selection

When starting work:

1. Find the first actionable TODO.
2. Check its dependencies.
3. Confirm that it belongs to the current project phase.
4. Inspect only the code needed for that task.
5. Implement it.
6. Validate it.
7. Update `TODO.md`.
8. Stop.

Do not skip ahead to future phases unless explicitly instructed.

---

# 7. Token Budget

Token usage must be treated as a limited daily resource.

The project should have a configurable daily budget:

```text
DAILY_TOKEN_BUDGET=50000
```

If the environment provides token usage information, track it.

Use this priority:

```text
Required task
→ Validation
→ Documentation
→ Optional improvements
```

Never spend tokens on optional improvements when the daily budget is close to being exhausted.

### Budget thresholds

At approximately:

* 50%: continue normally
* 75%: avoid unnecessary exploration
* 90%: finish only the current task
* 95%: stop implementation and provide status
* 100%: do not start another task

If exact token usage cannot be measured, use conservative estimates based on context size and tool output.

Never claim exact token usage unless the environment provides it.

---

# 8. Avoid Repeated Context

To reduce token consumption:

Do NOT repeatedly:

* Read the entire `PROJECT.md`
* Read the entire `AGENTS.md`
* Inspect unrelated directories
* Re-open unchanged files
* Explain already established architecture
* Research libraries unnecessarily
* Refactor working code without a reason

Prefer:

* Targeted file inspection
* Small diffs
* Existing dependencies
* Existing project patterns
* Existing utilities

---

# 9. Planning Before Coding

For small tasks:

Do not create a long plan.

Use:

```text
Goal
Files affected
Implementation
Validation
```

For architectural tasks:

Stop and produce a proposal before coding.

Architectural tasks include:

* API architecture
* Authentication architecture
* Database architecture
* Media storage architecture
* Navigation architecture
* State-management decisions
* New external services
* Native modules
* Significant infrastructure changes

Wait for approval before implementing major architectural changes.

---

# 10. Minimal Implementation Rule

Always implement the smallest solution that satisfies the task.

Do not add:

* Future features
* Generic frameworks
* Unused abstractions
* Extra configuration
* Unnecessary dependencies
* Premature optimization
* Complex state management

Example:

If the MVP needs five report statuses, do not build a configurable workflow engine.

---

# 11. React Native Code Quality

Use TypeScript strictly.

Prefer:

* Functional components
* Small screens
* Small reusable components
* Strong types
* Feature-oriented structure
* Custom hooks for reusable behavior
* Clear separation of UI and business logic
* Server-side validation
* Explicit error handling

Avoid:

* `any`
* Giant screen components
* Deep prop drilling
* Duplicated logic
* Hard-coded business rules
* Global state when local state is sufficient
* Premature abstractions

Prefer platform-independent React Native APIs unless a native dependency is genuinely required.

---

# 12. Project Structure

Prefer a structure similar to:

```text
src/
├── components/
├── features/
│   ├── reports/
│   ├── auth/
│   └── profile/
├── navigation/
├── hooks/
├── services/
├── utils/
├── types/
├── constants/
└── screens/
```

Organize new functionality around features rather than creating large global folders.

Do not reorganize the entire project unless required by the current task.

---

# 13. Navigation

Use React Navigation for app navigation.

Keep navigation structure explicit.

Example:

```text
Root Navigator
├── Auth Stack
│   ├── Login
│   └── Register
│
└── App Stack
    ├── Home
    ├── Create Report
    ├── Report Details
    └── Profile
```

Do not introduce complex navigation patterns unless required.

Handle:

* Loading state
* Authentication state
* Unauthorized access
* Back navigation
* Deep links only when required by the MVP

---

# 14. State Management

Start with local React state.

Use:

* `useState`
* `useReducer`
* `useContext`

only where appropriate.

Do not introduce Redux, Zustand, or another global state library unless the current task demonstrates a real need.

Server state should be kept separate from UI state.

Avoid putting API data into global state simply because it is convenient.

---

# 15. API / Backend

The mobile app must never be treated as a trusted client.

All important validation and authorization must happen server-side.

The app should:

* Handle network failures
* Handle timeouts
* Handle API errors
* Show useful loading states
* Support retry where appropriate
* Avoid duplicate submissions
* Handle expired authentication

Keep API communication inside services/hooks rather than scattering HTTP calls across screens.

Never hard-code secrets into the React Native application.

Anything shipped with the app should be considered publicly accessible.

---

# 16. Security

Treat all client input as untrusted.

Pay particular attention to:

* Authentication
* Authorization
* File uploads
* File type validation
* File size validation
* Object access
* API authorization
* Secrets
* XSS where applicable
* Deep links
* Local storage
* Signed media URLs

Never trust an ID supplied by the client to determine whether the user may access a resource.

Do not store sensitive credentials in plain AsyncStorage.

Use an appropriate secure storage mechanism when authentication credentials need to be persisted.

---

# 17. Forms

Forms must handle:

* Validation
* Field-level errors
* Loading state
* Submission errors
* Retry
* Success state
* Keyboard handling
* Mobile usability

Never clear user-entered data after a failed submission unless explicitly required.

Forms must work correctly with:

* Android keyboard
* iOS keyboard
* Small screens
* Different screen sizes
* Different orientations when applicable

---

# 18. Media

City Reporter allows citizens to submit photos and videos.

Photos and videos are untrusted user content.

Handle:

* Camera permissions
* Photo library permissions
* File type validation
* File size validation
* Upload progress where practical
* Upload failure
* Retry
* Preview
* Removal
* Large files
* Slow networks
* Cancellation

Do not unnecessarily load full-resolution media into memory.

Generate or use appropriate thumbnails/previews when required.

Avoid keeping multiple large copies of the same media in memory.

---

# 19. Camera

When implementing camera functionality:

Handle:

* Permission not granted
* Permission permanently denied
* Camera unavailable
* Capture failure
* Cancelled capture
* Invalid media
* Device differences

Never assume camera permission is available.

If permission is denied, provide a clear path for the user to retry or open device settings when appropriate.

---

# 20. Location

Location must be treated as structured data.

Store:

* Latitude
* Longitude
* Accuracy
* Capture timestamp

Handle:

* Permission denied
* Permission permanently denied
* Location unavailable
* Timeout
* Poor accuracy
* Retry
* Location services disabled

Never assume location access succeeds.

Do not continuously track location unless explicitly required.

For report creation, prefer capturing the user's location when the report is created rather than maintaining background location tracking.

---

# 21. Permissions

Request permissions only when they are needed.

Do not request all permissions during app startup.

Explain why a permission is required before requesting it when appropriate.

Permissions may differ between Android and iOS.

Test:

```text
Granted
Denied
Denied permanently
Previously granted
Previously denied
```

---

# 22. Mobile UX

The citizen experience is primarily mobile-first.

Prioritize:

* One-handed usage
* Clear primary actions
* Large touch targets
* Readable typography
* Clear feedback
* Short forms
* Minimal navigation depth
* Fast loading
* Offline/network failure messaging

Avoid:

* Desktop-style layouts
* Tiny controls
* Hover-dependent interactions
* Dense tables
* Excessive modal usage
* Unnecessary animations

The report creation flow should be as short as reasonably possible.

---

# 23. UI / Design

The product should feel:

* Modern
* Clean
* Civic-focused
* Trustworthy
* Fast
* Approachable

Avoid:

* Generic admin templates
* Excessive cards
* Excessive rounded corners
* Excessive shadows
* Excessive gradients
* Visual clutter
* Excessive badges
* Unnecessary animation

Use a consistent design system for:

* Typography
* Spacing
* Buttons
* Inputs
* Colors
* Icons
* Feedback states

Do not introduce a large UI library unless the project already uses one or the task requires it.

---

# 24. Responsive Design

React Native screens must work across:

* Small Android phones
* Large Android phones
* iPhones
* Tablets where applicable

Use flexible layouts.

Avoid hard-coded screen dimensions.

Prefer:

* Flexbox
* `useWindowDimensions`
* Responsive spacing
* `SafeAreaView` / appropriate safe-area handling

Do not implement desktop-only assumptions.

---

# 25. Offline / Network Handling

The MVP does not need a complete offline-first architecture unless explicitly required.

However, every network-dependent feature must handle:

```text
Loading
Success
Empty
Network error
Server error
Retry
```

Do not silently fail when the network is unavailable.

If offline report submission is not supported, clearly communicate that to the user.

---

# 26. Error / Loading / Empty States

A feature is incomplete if it only handles the happy path.

Consider:

* Loading
* Empty
* Error
* Retry
* Invalid input
* Unauthorized access
* Network failure
* Permission denial
* Upload failure

Errors should be understandable to normal users.

Avoid exposing raw API/server errors directly to users.

---

# 27. Performance

Mobile performance is important.

Prefer:

* Lazy loading where useful
* `FlatList` / `SectionList` for long lists
* Stable list keys
* Avoiding unnecessary re-renders
* Memoization only when it provides measurable benefit
* Optimized images
* Avoiding large objects in state
* Avoiding unnecessary API calls

Do not prematurely optimize.

Do not use `ScrollView` for potentially large dynamic lists when a virtualized list is appropriate.

---

# 28. Testing

For each meaningful feature, add the smallest useful automated test.

Prioritize:

* Validation
* Report creation
* Authentication
* Authorization
* Status transitions
* Media handling
* Location handling
* Critical user workflows

Test important behavior rather than implementation details.

Do not create tests purely to increase test count.

---

# 29. Native / Platform-Specific Code

Avoid native code unless React Native APIs or existing dependencies cannot reasonably solve the requirement.

Before adding a native dependency:

1. Check existing dependencies.
2. Check whether React Native already provides the functionality.
3. Check Android/iOS implications.
4. Consider maintenance cost.
5. Consider build complexity.

For major native dependencies, explain the reason before installation.

---

# 30. Dependencies

Do not install a dependency without a reason.

Before adding one:

* Check whether an existing dependency solves the problem.
* Consider whether the functionality can reasonably be implemented without it.
* Consider bundle size.
* Consider Android/iOS compatibility.
* Consider maintenance cost.

Do not install libraries simply because they are popular.

---

# 31. Existing Code

Before changing existing code:

1. Understand why it exists.
2. Identify dependencies.
3. Check whether other features use it.
4. Make the smallest safe change.

Do not rewrite working code simply because another approach looks cleaner.

---

# 32. Requirements Ambiguity

If ambiguity does not affect architecture, security, data integrity, or major UX:

> Make the simplest reasonable assumption and document it.

If ambiguity affects:

* Architecture
* Security
* Data integrity
* Authentication
* Database structure
* Major UX
* Native platform behavior

Stop and ask for clarification.

Do not invent complex requirements.

---

# 33. Scope Protection

If an implementation request introduces functionality outside the current MVP phase:

Do not automatically implement it.

Instead report:

```text
This is outside the current MVP task.

Current task:
TASK-XXX

Requested addition:
...

Impact:
...

Recommendation:
Defer to Phase X.
```

Only proceed if explicitly instructed.

---

# 34. Validation

Before marking a task DONE, run the relevant checks.

Depending on the task:

```text
Typecheck
Lint
Unit tests
Integration tests
Android build
iOS build
```

Do not run expensive checks unnecessarily after every tiny change if they are unrelated.

However, all required checks must pass before the relevant phase is considered complete.

For UI changes, also validate:

* Android rendering
* iOS rendering when available
* Keyboard behavior
* Permission behavior
* Different screen sizes

---

# 35. Session Completion

At the end of every task, provide:

```text
Completed:
- TASK-XXX

Changed:
- ...

Validation:
- ...

Next task:
- TASK-XXX

Token/budget status:
- Within budget / Near budget / Budget exhausted
```

Then stop.

Do not automatically continue to the next task unless explicitly instructed.

---

# 36. Important Rule

## Do not build ahead.

The correct behavior is:

```text
Read task
↓
Inspect relevant code
↓
Plan briefly
↓
Implement
↓
Validate
↓
Update TODO.md
↓
Report result
↓
STOP
```

Not:

```text
Read requirements
↓
Build entire application
↓
Add extra features
↓
Refactor everything
↓
Run out of tokens
```

The MVP should be built incrementally, one validated task at a time.
