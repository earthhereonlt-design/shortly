import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <DashboardShell
      user={user ? { name: user.name, email: user.email } : null}
    >
      {children}
    </DashboardShell>
  );
}
