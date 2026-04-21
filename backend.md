# Backend File Reference

**Stack:** Node.js + Express + TypeScript + Prisma ORM + PostgreSQL  
**Entry point:** `src/server.ts` → compiled to `dist/server.js`

---

## Root

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts (`dev`, `build`, `start`) |
| `tsconfig.json` | TypeScript compiler config |
| `nodemon.json` | Nodemon watch config for dev hot-reload |
| `.env` | Environment variables (DB URL, JWT secret, Cloudinary, Razorpay keys) |
| `.env.example` | Template for required env vars |
| `.gitignore` | Ignored files (node_modules, dist, .env) |

---

## `prisma/`

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Prisma schema — defines all DB models (User, Course, Program, Webinar, Payment, Interview, etc.) |

---

## `src/`

### `src/server.ts`
App bootstrap: creates Express app, registers middleware (CORS, JSON body parser, logger), mounts all routes from `routes/index.ts`, starts HTTP server.

---

### `src/db/`

| File | Purpose |
|------|---------|
| `src/db/prisma.ts` | Exports singleton Prisma client instance used across all services |

---

### `src/config/`

| File | Purpose |
|------|---------|
| `src/config/cloudinary.ts` | Initialises and exports the Cloudinary SDK client |

---

### `src/controllers/`

Controllers receive HTTP requests, validate input, call services, and send responses.

| File | Responsibility |
|------|---------------|
| `adminController.ts` | Admin CRUD for courses, webinars, programs, users, images; admin login/auth |
| `courseController.ts` | Public & admin course listing, detail, create, update, delete |
| `dashboardController.ts` | Fetches combined dashboard data for authenticated users |
| `imageController.ts` | Uploads images and videos to Cloudinary |
| `interviewController.ts` | Mock interview data retrieval, booking, and cancellation |
| `paymentController.ts` | Razorpay order creation, payment verification, webhook handling |
| `profileController.ts` | Get and update user profile |
| `programController.ts` | Training program CRUD, program payment order creation and verification |
| `userController.ts` | User create/upsert (Firebase-backed), phone check, fetch by Firebase UID |
| `webinarController.ts` | Public & admin webinar listing, detail, create, update, delete |

---

### `src/middlewares/`

| File | Purpose |
|------|---------|
| `auth.ts` | `authenticate` (verify Firebase JWT), `optionalAuthenticate`, `isAdmin` guards |
| `errorHandler.ts` | `AppError` class, `asyncHandler` wrapper, `handleValidationErrors`, global error middleware |
| `upload.ts` | Multer config: `uploadSingle` (images), `uploadVideo` (video), memory storage |

---

### `src/routes/`

All routes are aggregated in `index.ts` and mounted under `/api`.

| File | Mount path | Key endpoints |
|------|-----------|---------------|
| `index.ts` | `/api` | Aggregates all sub-routers |
| `userRoutes.ts` | `/api/users` | `POST /create`, `GET /check-phone/:phone`, `GET /:firebaseUid` |
| `courseRoutes.ts` | `/api/courses` | `GET /`, `GET /:id`, admin create/update/delete |
| `webinarRoutes.ts` | `/api/webinars` | `GET /`, `GET /:id`, admin create/update/delete |
| `programRoutes.ts` | `/api/programs` | `GET /`, `GET /:id`, payment order/verify, admin CRUD |
| `paymentRoutes.ts` | `/api/payments` | `POST /create-order`, `POST /verify`, `POST /webhook` |
| `dashboardRoutes.ts` | `/api/dashboard` | `GET /` (auth required) |
| `interviewRoutes.ts` | `/api/interviews` | `GET /`, `POST /book`, `DELETE /bookings/:id` |
| `profileRoutes.ts` | `/api/profile` | `GET /`, `PATCH /` |
| `adminRoutes.ts` | `/api/admin` | Admin login, full CRUD for all entities, image upload |

---

### `src/services/`

Services contain business logic and all direct Prisma DB queries.

| File | Responsibility |
|------|---------------|
| `courseService.ts` | CRUD for courses, enrollment checks, enrollment creation |
| `courseServicePrisma.ts` | Alternate/draft Prisma-based course service (unused/experimental) |
| `dashboardService.ts` | Aggregates enrolled courses, programs, webinars, profile stats for dashboard |
| `interviewService.ts` | Fetch available interview slots, create/cancel bookings |
| `paymentService.ts` | Razorpay order creation, signature verification, enrollment on success |
| `profileService.ts` | Full profile fetch (user + certifications + skill badges + program stats) and update |
| `programService.ts` | Training program CRUD, Razorpay payment for program enrollment |
| `userService.ts` | Upsert user from Firebase data, fetch by UID, phone lookup |
| `webinarService.ts` | CRUD for webinars, webinar registration |

---

### `src/utils/`

| File | Purpose |
|------|---------|
| `imageUpload.ts` | `uploadToCloudinary` and `uploadVideoToCloudinary` helper functions |
| `logger.ts` | Winston logger config; writes to `logs/combined.log` and `logs/error.log` |
| `razorpay.ts` | Razorpay client initialisation, `verifyRazorpaySignature`, `verifyWebhookSignature` |

---

## `logs/`

| File | Purpose |
|------|---------|
| `logs/combined.log` | All log output (info + error) |
| `logs/error.log` | Error-only log output |

---

## `dist/`

Compiled JavaScript output from `tsc`. Mirrors the `src/` structure. Not edited directly — generated by `npm run build`.
