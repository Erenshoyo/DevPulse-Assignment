# DevPulse API

Live URL: https://devpulseapiproject1.vercel.app

## Overview

DevPulse API is a TypeScript-based issue tracking backend built with Express and PostgreSQL. It supports user authentication, issue creation and management, role-based access control, and secure token handling.

## Features

- User signup and login with JWT authentication
- Refresh token support using secure HTTP-only cookies
- Role-based access control for contributors and maintainers
- Create, read, update, and delete issue records
- Issue filtering and sorting by type, status, and creation date
- Centralized error handling and structured JSON responses

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt
- cors
- cookie-parser
- tsup for production build

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd B7A2-DevPulseAPI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```env
   CONNECTION_STRING=postgres://<user>:<password>@<host>:<port>/<database>
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_jwt_secret
   ```

4. Run the application in development mode:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   ```

6. Start the compiled app:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup`
  - Register a new user
  - Required body: `name`, `email`, `password`
  - Optional body: `role` (`contributor` or `maintainer`)

- `POST /api/auth/login`
  - Authenticate a user
  - Required body: `email`, `password`
  - Returns: access token and user details

- `POST /api/auth/refresh`
  - Refresh JWT access token
  - Reads refresh token from cookie

### Issues

- `POST /api/issues`
  - Create a new issue
  - Requires `Authorization` header with bearer token
  - Body: `title`, `description`, `type`
  - `type` must be `bug` or `feature_request`

- `GET /api/issues`
  - Get all issues
  - Optional query params:
    - `type` (`bug` | `feature_request`)
    - `status` (`open` | `in_progress` | `resolved`)
    - `sort` (`newest` | `oldest`)

- `GET /api/issues/:id`
  - Get a single issue by ID

- `PATCH /api/issues/:id`
  - Update an issue
  - Requires `Authorization` header with bearer token
  - Contributors may update their own open issues but cannot change `status`
  - Maintainers may update any issue and modify `status`

- `DELETE /api/issues/:id`
  - Delete an issue by ID
  - Requires `Authorization` header with bearer token
  - Requires maintainer role

## Database Schema Summary

### `users`

- `id` - serial primary key
- `name` - varchar(40), required
- `email` - varchar(40), unique, required
- `password` - varchar(255), required
- `role` - varchar(20), required, default `contributor`
  - Allowed values: `contributor`, `maintainer`
- `created_at` - timestamp, defaults to `NOW()`
- `updated_at` - timestamp, defaults to `NOW()`

### `issues`

- `id` - serial primary key
- `title` - varchar(150), required
- `description` - text, required
- `type` - varchar(20), required
  - Allowed values: `bug`, `feature_request`
- `status` - varchar(20), required, default `open`
  - Allowed values: `open`, `in_progress`, `resolved`
- `reporter_id` - integer, required, references `users.id`
- `created_at` - timestamp, defaults to `NOW()`
- `updated_at` - timestamp, defaults to `NOW()`

## Notes

- The app initializes database tables automatically at startup.
- Authentication uses JWT tokens, and refresh tokens are stored in an HTTP-only cookie.
- Logged-in users can create and update issues, while maintainers have additional delete privileges.
