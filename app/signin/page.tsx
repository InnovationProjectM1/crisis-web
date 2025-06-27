import { SignInForm } from "@/components/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-background p-2 px-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold">Crisis Monitor</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Sign in to access the crisis monitoring dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
