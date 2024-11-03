"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the User type to specify the structure of each user object
interface User {
  email: string;
  role: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Step 1: Perform login request
    const loginResponse = await fetch(
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

    if (loginResponse.ok) {
      setMessage(`Successful login for Email: ${email}`);
      setMessageType("success");

      // Step 2: Fetch all users and find the logged-in user's role
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_USER_DATABASE}/users`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const users: User[] = await userResponse.json();

        // Filter the users array to find the logged-in user by email
        const currentUser = users.find((user: User) => user.email === email);

        if (currentUser && currentUser.role) {
          const userRole = currentUser.role;

          // Step 3: Redirect based on user role
          if (userRole === "admin") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        } else {
          setMessage("Role data not found for the logged-in user.");
          setMessageType("error");
          console.error("User Role not found in the data:", currentUser);
        }
      } else {
        setMessage("Failed to retrieve user information.");
        setMessageType("error");
      }
    } else {
      const errorData = await loginResponse.json();
      setMessage(`Login failed: ${errorData.message}`);
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <Layout>
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
              {loading ? "Logging in..." : "Login"}
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
          <Button variant="secondary" className="w-full">
            <Link href="/" className="flex items-center">
              Back
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}