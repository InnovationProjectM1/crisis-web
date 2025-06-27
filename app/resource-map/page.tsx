import { DashboardLayout } from "@/components/dashboard-layout";
import { ResourceMap } from "@/components/resource-map";

export default function ResourceMapPage() {
  return (
    <DashboardLayout title="Resource Map">
      <ResourceMap />
    </DashboardLayout>
  );
}
