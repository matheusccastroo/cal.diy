# Fork changes

This fork runs Cal.diy as an API-only backend for a chatbot server. Only that server can access it. This list shows what is different from the upstream project.

## API

- Added an admin API key (`ADMIN_API_KEY` in the `.env` file). With the `x-cal-user-id` header, it acts as any user.
- The admin API key has no rate limit.
- Added the users endpoint (`/v2/users`) for CRUD operations.
- `GET /v2/users?chatbotUserId=<id>` finds the user with this `chatbotUserId` in its metadata. It returns 404 if no user matches and 409 if more than one user matches.
- A new user gets a default schedule. It gets no default event types.
- A new user must have `chatbotUserId` in its metadata.
- A new event type must have `chatbotServiceId` in its metadata. An event type update that sends metadata must also send `chatbotServiceId`.
- The event type outputs return `metadata.chatbotServiceId`.
- A new booking must have `chatbotBookingId` in its metadata.
- A booking without a location keeps no location. It does not fall back to Cal Video.
- Only these routes are available: users, me, bookings, schedules, event types, slots and health. All other routes return 404.
- The API always uses the latest version of each route. The `cal-api-version` header is ignored.

## Defaults

- Emails are disabled by default.
- Sign-up is disabled by default.
- The default locale is `pt-BR` for new users, booking attendees and calendar links.

## Docker

- Docker Compose runs only the API, the database and Redis.
- The web app and Prisma Studio are removed from Docker Compose.
- The API applies the database migrations when it starts.
