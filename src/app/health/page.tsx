import { getHealthPageData } from "@/app/health/page.utils";
import { TrainingLoadSummary } from "@/app/health/components/TrainingLoadSummary";
import { formatSleepDuration } from "@/lib/health";
import { deriveForm } from "@/lib/health";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const { activities, wellness } = await getHealthPageData();
  const latestActivity = activities[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Health</h1>

      {latestActivity ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Training load</h2>
          <TrainingLoadSummary ctl={latestActivity.ctl} atl={latestActivity.atl} />
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-400">No training data available. Check your Intervals.icu connection.</p>
        </div>
      )}

      {wellness && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Today&apos;s wellness</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {wellness.hrv != null && (
              <div>
                <dt className="text-xs text-zinc-400">HRV</dt>
                <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{wellness.hrv}</dd>
              </div>
            )}
            {wellness.restingHr != null && (
              <div>
                <dt className="text-xs text-zinc-400">Resting HR</dt>
                <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{wellness.restingHr} bpm</dd>
              </div>
            )}
            {wellness.weight != null && (
              <div>
                <dt className="text-xs text-zinc-400">Weight</dt>
                <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{wellness.weight} kg</dd>
              </div>
            )}
            {wellness.sleepSecs != null && (
              <div>
                <dt className="text-xs text-zinc-400">Sleep</dt>
                <dd className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatSleepDuration(wellness.sleepSecs)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {activities.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent activities</h2>
          <ul className="space-y-2">
            {activities.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{a.name}</span>
                  <span className="ml-2 text-xs text-zinc-400">{a.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>{Math.round(a.movingTime / 60)}min</span>
                  <span className="tabular-nums">CTL {Math.round(a.ctl)} / ATL {Math.round(a.atl)} / Form {Math.round(deriveForm(a.ctl, a.atl))}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
