// `app/dashboard/register/page.tsx` is the UI for the `/dashboard/register` URL
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FormEvent, useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Successful registration for Email:", email);
  };

  return (
    <div className="flex flex-col items-center justify-top min-h-screen">
      <h1 className="text-3xl font-bold mb-8 mt-8">Register Page!</h1>
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
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
