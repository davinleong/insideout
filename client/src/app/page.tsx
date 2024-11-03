// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
import { Button } from "@/components/ui/button";
import { LogIn, UserPen } from "lucide-react";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Inside Out</h1>
        <p className="text-lg text-center mb-8">Your emotion-aware conversational AI assistant</p>
        
        <nav>
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <Button className="text-xl">
                <Link href="/dashboard/register" className="flex items-center">
                  <UserPen className="mr-4" />
                  Register
                </Link>
              </Button>
            </li>
            <li>
              <Button className="text-xl">
                <Link href="/dashboard/login" className="flex items-center">
                  <LogIn className="mr-4" />
                  Login
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </Layout> 
  );
}