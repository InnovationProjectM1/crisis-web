import { DashboardLayout } from "@/components/dashboard-layout";
import { SettingsPage } from "@/components/settings-page";

export default function Settings() {
  return (
    <DashboardLayout title="Settings">
      <SettingsPage />
    </DashboardLayout>
  );
}
