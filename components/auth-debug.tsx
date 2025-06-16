"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthDebug() {
  const { data: session, status } = useSession();

  const debugInfo = {
    nextAuthUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL || "Not set",
    nodeEnv: process.env.NODE_ENV,
    currentUrl:
      typeof window !== "undefined" ? window.location.href : "Server side",
    sessionStatus: status,
    session: session,
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Debug Info:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="space-x-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <p>Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
