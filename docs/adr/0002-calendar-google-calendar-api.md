# Calendar Module reads from Google Calendar, not a custom event store

The Calendar Module is an Aggregated Module — it displays events from Thomas's existing Google Calendar rather than managing its own event data. Auth uses email/password (not Google SSO), so Google Calendar access uses a long-lived OAuth refresh token stored as `GOOGLE_REFRESH_TOKEN` in environment variables. A one-time browser-based consent flow yields the refresh token; the app exchanges it for access tokens silently at runtime using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

There is no events table in the database.
