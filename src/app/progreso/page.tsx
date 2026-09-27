import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserMeasurementsChronological,
  getUserMeasurementsHistory,
  calculateProgressSummary,
} from "@/lib/measurements";
import { ProgressView } from "@/components/progress/ProgressView";
import { UnitPreference } from "@/lib/units";

export const metadata = {
  title: "Mi Progreso Corporal — FitCouple",
};

export default async function ProgresoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [chronological, history] = await Promise.all([
    getUserMeasurementsChronological(user.id),
    getUserMeasurementsHistory(user.id),
  ]);

  const summary = calculateProgressSummary(chronological);

  const userSlug = user.slug as "el" | "ella";
  const userName = user.profile?.displayName || user.name;
  const unit = (user.profile?.unitPreference as UnitPreference) || "kg";

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
      <ProgressView
        userSlug={userSlug}
        userName={userName}
        unit={unit}
        measurementsHistory={history}
        measurementsChronological={chronological}
        summary={summary}
      />
    </main>
  );
}
