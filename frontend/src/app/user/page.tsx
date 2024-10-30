// src/app/user/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Import shadcn button component

export default function UserLandingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to Your MoodLight AI!</h1>
      <p className="mb-4">Here you can access your services and manage settings.</p>

      <div className="flex gap-4">
        <Button variant="default" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push("/settings")}>
          Account Settings
        </Button>
        <Button variant="destructive" onClick={() => router.push("/login")}>
          Logout
        </Button>
      </div>
    </main>
  );
}
