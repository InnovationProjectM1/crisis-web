import { DashboardLayout } from "@/components/dashboard-layout";
import { TrendsAnalysis } from "@/components/trends-analysis";

export default function TrendsPage() {
  return (
    <DashboardLayout title="Trends">
      <TrendsAnalysis />
    </DashboardLayout>
  );
}
