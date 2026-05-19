import { getActivities, getWellness } from "@/lib/intervals-icu";
import type { Activity, Wellness } from "@/lib/intervals-icu";

export interface HealthPageData {
  activities: Activity[];
  wellness: Wellness | null;
}

export async function getHealthPageData(): Promise<HealthPageData> {
  const today = new Date().toLocaleDateString("en-CA");
  try {
    const [activities, wellness] = await Promise.all([
      getActivities(),
      getWellness(today),
    ]);
    return { activities: activities.slice(0, 10), wellness };
  } catch {
    return { activities: [], wellness: null };
  }
}
