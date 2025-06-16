import { DashboardLayout } from "@/components/dashboard-layout";
import { ApiTest } from "@/components/api-test";

export default function ApiTestPage() {
  return (
    <DashboardLayout title="API Test">
      <ApiTest />
    </DashboardLayout>
  );
}
