import { type FC } from "react";
import { deriveForm } from "@/lib/health";

interface TrainingLoadSummaryProps {
  ctl: number;
  atl: number;
}

export const TrainingLoadSummary: FC<TrainingLoadSummaryProps> = ({ ctl, atl }) => {
  const form = deriveForm(ctl, atl);
  const formColor =
    form > 5
      ? "text-emerald-600 dark:text-emerald-400"
      : form < -10
        ? "text-red-500 dark:text-red-400"
        : "text-zinc-600 dark:text-zinc-400";

  return (
    <div className="flex gap-6">
      <div className="text-center">
        <p className="text-xs text-zinc-400">Fitness (CTL)</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{Math.round(ctl)}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-zinc-400">Fatigue (ATL)</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{Math.round(atl)}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-zinc-400">Form (TSB)</p>
        <p className={`text-2xl font-semibold ${formColor}`}>{Math.round(form)}</p>
      </div>
    </div>
  );
};
