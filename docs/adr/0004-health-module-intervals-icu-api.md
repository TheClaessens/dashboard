# Health Module data sourced from Intervals.icu API

The Health Module is an Aggregated Module. Thomas uses Garmin hardware and Apple Health, neither of which offers a convenient developer API for third-party apps. Both sync to Intervals.icu, which has a documented REST API. Using Intervals.icu as the single integration point gives access to activities, training load metrics (CTL/ATL/TSB), HRV, resting heart rate, weight, and sleep — without needing to integrate Apple Health or Garmin directly.

There is no health data table in the app's database; all data is fetched from Intervals.icu at read time.
