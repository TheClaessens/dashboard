# Calendar Module reads from Google Calendar, not a custom event store

The Calendar Module is an Aggregated Module — it displays events from Thomas's existing Google Calendar rather than managing its own event data. Since Google SSO is already required for login, the `calendar.readonly` OAuth scope can be requested at authentication time, giving access to real calendar data with no additional infrastructure or data duplication.

There is no events table in the database.
