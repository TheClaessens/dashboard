export function deriveForm(ctl: number, atl: number): number {
  return ctl - atl;
}

export function formatSleepDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}
