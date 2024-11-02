// `app/dashboard/login/page.tsx` is the UI for the `/dashboard/login` URL
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    // Handle form submission logic here
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_DATABASE}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );
    console.log(response);
    if (response.ok) {
      setMessage(`Successful login for Email: ${email}`);
      setMessageType("success");
      // Handle successful login (e.g., redirect to login page)
    } else {
      const errorData = await response.json();
      setMessage(`Login failed: ${errorData.message}`);
      setMessageType("error");
      // Handle login error (e.g., display error message)
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-top min-h-screen">
      <h1 className="text-3xl font-bold mb-8 mt-8">Login Page!</h1>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        {loading && <p className="mt-4">Loading...</p>}
        {message && (
          <p
            className={`mt-4 ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <Button variant="secondary" className="text-xl">
          <Link href="/dashboard/" className="flex items-center">
            Back
          </Link>
        </Button>
      </div>
    </div>
  );
}
