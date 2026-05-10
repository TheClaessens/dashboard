# Calendar Module reads from Google Calendar, not a custom event store

The Calendar Module is an Aggregated Module — it displays events from Thomas's existing Google Calendar rather than managing its own event data. Auth uses email/password (not Google SSO), so Google Calendar access requires a separate OAuth flow or a service account with a long-lived API key stored as an environment variable. The specific mechanism is deferred to when issue #3 is implemented.

There is no events table in the database.
