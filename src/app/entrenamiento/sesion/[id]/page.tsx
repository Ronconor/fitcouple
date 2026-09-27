import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWorkoutSession } from "@/lib/sessions";
import { ActiveSessionView } from "@/components/workouts/ActiveSessionView";
import { UnitPreference } from "@/lib/units";

export const metadata = {
  title: "Sesión en Curso — FitCouple",
};

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const session = await getWorkoutSession(id, user.id);

  if (!session) {
    redirect("/entrenamiento");
  }

  const userSlug = user.slug as "el" | "ella";
  const userName = user.profile?.displayName || user.name;
  const unit = (user.profile?.unitPreference as UnitPreference) || "kg";

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
      <ActiveSessionView
        session={session}
        userSlug={userSlug}
        userName={userName}
        unit={unit}
      />
    </main>
  );
}
