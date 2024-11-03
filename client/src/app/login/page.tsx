//login/page.tsx
// Login page

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import messages from "@/constants/messages"; // Importing messages

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_DATABASE}/login`,
      {
        method: "POST",
        credentials: "include", // Send/receive cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.ok) {
      const responseData = await response.json();

      setMessage(`${messages.auth.loginSuccess} Email: ${email}`);
      
      setMessageType("success");
      const x = document.cookie;
      console.log("test");
      console.log(x);
      // On the page where you log in
      console.log("Cookies after login:", document.cookie);
    } else {
      const errorData = await response.json();
      setMessage(`${messages.auth.loginFailed}: ${errorData.message}`);
      setMessageType("error");
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        {loading && <p className="mt-4">{messages.loading}</p>}
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
          <Link href="/" className="flex items-center">
            Back
          </Link>
        </Button>
      </div>
    </div>
  );
}