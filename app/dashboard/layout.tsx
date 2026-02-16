"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ProductGuard } from "@/components/ProductGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <MobileNavigation />
      <main className="sidebar-main-content p-6">
        <ProductGuard productSlug="rascal-mail">{children}</ProductGuard>
      </main>
    </div>
  );
}
