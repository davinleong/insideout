// src/components/ui/Header.tsx
import { Button } from "@/components/ui/button";

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}
