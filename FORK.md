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

## Bookings

- `POST /v2/bookings` accepts an optional `recurrence: { frequency, count }`. `frequency` is `daily`, `weekly` or `monthly`. The event type does not need a recurrence.
- A request cannot have both `recurrence` and `recurrenceCount`.
- `count` is the number of calendar dates to make, from 2 to 366. A repeat of 1 year stops at 1 year.
- The API calculates the dates in the time zone of the user. A monthly date keeps the day of the month. If a month does not have that day, the API uses the last day of the month.
- For `daily` and `monthly`, the API removes each date that is not fully in the working hours of the user. It never removes the first date.
- A recurrence of the event type (`recurringEvent`) keeps the upstream behavior. The dates use the time zone of the attendee, and the API removes no date.
- The API checks all occurrences before it writes the first occurrence. If an occurrence is not available, the API returns 400 with `error.code` set to `occurrence_unavailable`. It makes no booking.
- If the write of an occurrence fails, the API cancels the occurrences that the request wrote. For a seated event type, it cancels only the seats of the request. If a cancel fails, the API logs it and continues. The response has the error of the write.
- Each occurrence gets the request metadata. The response is an array with one item for each occurrence.
- The recurrence frequency enum of the API has `daily`.
- `POST /v2/bookings/:uid/reschedule` accepts an optional `eventTypeId`. The booking moves to that event type, and the owner of the event type becomes the host.
- A reschedule to another event type gets the event type checks of a new booking: required authentication, managed parent event type and team hosts.
- The reschedule accepts optional `bookingFieldsResponses`. They add responses to the booking, for example for the required booking fields of the new event type. They do not change the existing responses.
- The reschedule accepts an optional `lengthInMinutes` with any value. Without it, the new booking gets the length of the event type.
- A reschedule to another host does not remove the old host's external calendar event. Fix this before calendar sync.

## Defaults

- Emails are disabled by default.
- Sign-up is disabled by default.
- The default locale is `pt-BR` for new users, booking attendees and calendar links.

## Docker

- Docker Compose runs only the API, the database and Redis.
- The web app and Prisma Studio are removed from Docker Compose.
- The API applies the database migrations when it starts.
