//src/app/login/resetPassword/page.tsx
// Reset Password Page

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/app/layout';
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const resetToken = searchParams.get("token");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_DATABASE}/resetPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, password }),
      }
    );

    if (response.ok) {
      setMessage("Password successfully reset.");
      setMessageType("success");
      router.push("/dashboard/login");
    } else {
      const errorData = await response.json();
      setMessage(`Error: ${errorData.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
   <Layout>
       <div className="flex flex-col items-center justify-top min-h-screen">
        <h1 className="text-3xl font-bold mb-8 mt-8">Reset Password</h1>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          {message && (
            <p
              className={`mt-4 ${
                messageType === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
   </Layout>
  );
}