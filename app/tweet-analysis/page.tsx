import { DashboardLayout } from "@/components/dashboard-layout";
import { TweetAnalysis } from "@/components/tweet-analysis";

export default function TweetAnalysisPage() {
  return (
    <DashboardLayout title="Tweet Analysis">
      <TweetAnalysis />
    </DashboardLayout>
  );
}
