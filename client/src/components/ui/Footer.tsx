// src/components/ui/Footer.tsx
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 p-4 text-white text-center mt-auto">
      <p>&copy; {new Date().getFullYear()} My Mood-Based Light Control App. All rights reserved.</p>
      <nav className="mt-2 flex justify-center gap-4">
        <Button asChild variant="link">
          <a href="/terms">Terms of Service</a>
        </Button>
        <Button asChild variant="link">
          <a href="/privacy">Privacy Policy</a>
        </Button>
      </nav>
    </footer>
  );
}
