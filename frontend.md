# Frontend File Reference

**Stack:** React (CRA) + React Router v6 + Tailwind CSS + Firebase Auth  
**Entry point:** `src/index.js` → mounts `<App />` into `public/index.html`

---

## Root

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts (`start`, `build`) |
| `.env` | Environment variables (API base URL, Firebase config keys) |
| `.env.example` | Template for required env vars |
| `.gitignore` | Ignored files (node_modules, build, .env) |

---

## `public/`

Static assets served at the root URL.

| File | Purpose |
|------|---------|
| `public/index.html` | HTML shell; React mounts here |
| `public/logo.png` | Site logo |
| `public/AI.jpg` | AI course thumbnail |
| `public/AITools.jpeg` | AI Tools course thumbnail |
| `public/FullStack.jpg` | Full Stack course thumbnail |
| `public/image1.jpeg` | Generic promo image |
| `public/image2.jpeg` | Generic promo image |
| `public/image3.jpeg` | Generic promo image |
| `public/robots.txt` | SEO crawler directives |
| `public/sitemap.xml` | SEO sitemap |

---

## `src/`

### `src/index.js`
App entry — renders `<App />` wrapped in context providers inside `<React.StrictMode>`.

### `src/App.js`
Root router component. Defines all `<Route>` mappings, wraps routes in auth guards (`ProtectedRoute`, `AdminProtectedRoute`).

### `src/index.css`
Global CSS / Tailwind directives.

---

### `src/config/`

| File | Purpose |
|------|---------|
| `config/api.js` | Axios instance with `baseURL` from env; attaches Firebase ID token to every request |
| `config/firebase.js` | Firebase app initialisation and `auth` export |

---

### `src/contexts/`

| File | Purpose |
|------|---------|
| `contexts/AuthContext.js` | Firebase auth state (`currentUser`, `login`, `logout`, `signUp`); wraps entire app |
| `contexts/AdminContext.js` | Admin session state; `createAdminApi` factory for admin-authed Axios calls |
| `contexts/DashboardContext.js` | Shared data for dashboard pages (enrolled courses, programs, interviews, profile) |

---

### `src/hooks/`

| File | Purpose |
|------|---------|
| `hooks/useRazorpay.js` | Hook that loads the Razorpay checkout script and exposes `openRazorpay` |
| `hooks/useRazorpay.js.backup` | Backup of the hook (not imported anywhere) |

---

### `src/components/`

#### Layout / Navigation

| File | Purpose |
|------|---------|
| `components/Header.js` | Top navigation bar with auth state-aware links |
| `components/Footer.js` | Site-wide footer |

#### Home Page Sections

| File | Purpose |
|------|---------|
| `components/HeroSection.js` | Landing hero with CTA |
| `components/ProblemSection.js` | "Problem we solve" section |
| `components/FeaturedCourses.js` | Highlights top courses on home page |
| `components/FeaturedWebinars.js` | Highlights upcoming webinars on home page |
| `components/TrainingPrograms.js` | Training programs promo section |
| `components/CareerJourney.js` | Career roadmap/journey visualisation |
| `components/Mentors.js` | Mentor showcase section |
| `components/MockInterviews.js` | Mock interview promo section |
| `components/PlacementPortal.js` | Placement portal feature highlight |
| `components/PlatformEcosystem.js` | Platform feature overview |
| `components/IndustrialCertification.js` | Certification section |
| `components/EarlyAccess.js` | Early access sign-up banner |
| `components/ComingSoon.js` | Coming soon placeholder page |
| `components/ComingSoonBanner.js` | Banner strip for upcoming features |

#### Auth Guards

| File | Purpose |
|------|---------|
| `components/ProtectedRoute.js` | Redirects unauthenticated users to `/auth` |
| `components/AdminProtectedRoute.js` | Redirects non-admin users away from admin routes |

#### Dashboard Layout

| File | Purpose |
|------|---------|
| `components/dashboard/DashboardLayout.js` | Sidebar + layout shell used by all dashboard pages |

#### Shared UI

| File | Purpose |
|------|---------|
| `components/shared/LoadingSpinner.js` | Reusable loading spinner |
| `components/shared/ErrorMessage.js` | Reusable error message display |
| `components/shared/ProgressBar.js` | Reusable progress bar |

---

### `src/pages/`

#### Public Pages

| File | Route | Purpose |
|------|-------|---------|
| `HomePage.js` | `/` | Landing page composed of home section components |
| `CoursesPage.js` | `/courses` | Browse all available courses |
| `CourseDetailPage.js` | `/courses/:id` | Individual course detail and enroll CTA |
| `CourseContentPage.js` | `/courses/:id/content` | In-course video/content player (auth required) |
| `WebinarsPage.js` | `/webinars` | Browse all webinars |
| `WebinarDetailPage.js` | `/webinars/:id` | Individual webinar detail page |
| `ProgramsPage.js` | `/programs` | Browse training programs (uses DashboardContext) |

#### Auth Pages

| File | Route | Purpose |
|------|-------|---------|
| `AuthPage.js` | `/auth` | Primary sign-in / sign-up page (Firebase) |
| `CleanAuthPage.js` | — | Alternate minimal auth page |
| `FirestoreAuthPage.js` | — | Auth page with Firestore integration (experimental) |
| `WelcomePage.js` | `/welcome` | Post-login welcome / onboarding screen |

#### Enrollment Flow

| File | Route | Purpose |
|------|-------|---------|
| `EnrollVerifyPhonePage.js` | `/enroll/:id/verify-phone` | Phone number verification step before payment |
| `EnrollPaymentPage.js` | `/enroll/:id/payment` | Razorpay payment initiation for program enrollment |

#### User Dashboard Pages (auth-protected, use DashboardContext + DashboardLayout)

| File | Route | Purpose |
|------|-------|---------|
| `DashboardPage.js` | `/dashboard` | Main user dashboard overview |
| `UserDashboard.js` | — | Alternate/older user dashboard (legacy) |
| `MyCoursesPage.js` | `/dashboard/courses` | User's enrolled courses |
| `InterviewsPage.js` | `/dashboard/interviews` | Mock interview slots and bookings |
| `UserProfilePage.js` | `/dashboard/profile` | User profile view and edit |

#### Admin Pages (admin-protected, use AdminContext)

| File | Route | Purpose |
|------|-------|---------|
| `AdminLoginPage.js` | `/admin/login` | Admin login form |
| `AdminDashboard.js` | `/admin` | Admin overview dashboard |
| `AdminCoursesPage.js` | `/admin/courses` | Manage courses (active version) |
| `AdminCoursesPageWithUpload.js` | — | Courses page variant with image upload (experimental) |
| `AdminCoursesPage.old.js` | — | Old courses page (not in routing) |
| `AdminWebinarsPage.js` | `/admin/webinars` | Manage webinars |
| `AdminProgramsPage.js` | `/admin/programs` | Manage training programs |
| `AdminInterviewsPage.js` | `/admin/interviews` | Manage interview slots |
| `AdminCertificationsPage.js` | `/admin/certifications` | Manage certifications |
| `AdminUsersPage.js` | `/admin/users` | View and manage users |

---

## `build/`

Production build output from `npm run build`. Not edited directly — mirrors `public/` plus compiled JS/CSS bundles under `build/static/`.
