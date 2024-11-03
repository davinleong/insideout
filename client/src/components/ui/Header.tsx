"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the `authToken` cookie by setting it with an expired date
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to the login page
    router.push("/dashboard/login");
  };

  return (
    <header className="w-full bg-black py-6 text-white shadow-md">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold tracking-tight text-center text-white">
          My Mood-Based Light Control App
        </h1>
        <nav className="mt-4 flex justify-center gap-4">
          <Button asChild variant="ghost" className="hover:bg-gray-700 text-white transition-colors">
            <a href="/">Home</a>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-gray-700 text-white transition-colors">
            <a href="/user">User Dashboard</a>
          </Button>
          <Button asChild variant="ghost" className="hover:bg-gray-700 text-white transition-colors">
            <a href="/settings">Settings</a>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="hover:bg-gray-700 text-white transition-colors"
          >
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}