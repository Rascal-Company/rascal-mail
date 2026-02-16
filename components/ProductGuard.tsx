"use client";

import { Loader2 } from "lucide-react";
import { useProductAccess } from "@/hooks/useProductAccess";
import { NoAccessPage } from "@/components/NoAccessPage";

export function ProductGuard({
  productSlug,
  children,
}: {
  productSlug: string;
  children: React.ReactNode;
}) {
  const { hasAccess, currentProduct, isLoading } =
    useProductAccess(productSlug);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Tarkistetaan käyttöoikeuksia...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return <NoAccessPage currentProduct={currentProduct} />;
  }

  return <>{children}</>;
}
