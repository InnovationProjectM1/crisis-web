"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Check, Save } from "lucide-react";

export function UserProfile() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your account details and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={session?.user?.image || ""}
              alt={session?.user?.name || "User"}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{session?.user?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              defaultValue={session?.user?.name?.split(" ")[0] || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              defaultValue={session?.user?.name?.split(" ")[1] || ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={session?.user?.email || ""}
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Your email is managed by your Google account.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself"
            defaultValue="Crisis response coordinator with experience in emergency management."
          />
        </div>

        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
