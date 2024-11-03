// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
import { Button } from "@/components/ui/button";
import { LogIn, UserPen } from "lucide-react";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-8">
      {/* <h1 className="text-3xl mb-8">Welcome!</h1> */}
      <nav>
        <ul className="flex flex-col items-center space-y-4">
          <li>
            <Button className="text-xl">
              <Link href="/register" className="flex items-center">
                <UserPen className="mr-4" />
                Register
              </Link>
            </Button>
          </li>
          <li>
            <Button className="text-xl">
              <Link href="/login" className="flex items-center">
                <LogIn className="mr-4" />
                Login
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}