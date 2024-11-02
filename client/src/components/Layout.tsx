// src/components/Layout.tsx
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-8">{children}</main>
      <Footer />
    </div>
  );
}
