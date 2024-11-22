"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Call API to initiate the password reset
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_DATABASE}/forgotPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (response.ok) {
      setMessage("Password reset link sent to your email.");
      setMessageType("success");
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
        <h1 className="text-3xl font-bold mb-8 mt-8">Forgot Password</h1>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
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
          <Button variant="secondary" className="w-full">
            <Link href="/dashboard/login" className="flex items-center">
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}