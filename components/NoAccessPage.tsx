"use client";

import { ShieldX, Clock, ArrowRight, Mail } from "lucide-react";

type OrgProduct = {
  product_slug: string;
  product_name: string;
  product_icon: string | null;
  is_enabled: boolean;
  plan_tier: string;
  trial_ends_at: string | null;
  has_access: boolean;
};

export function NoAccessPage({
  currentProduct,
}: {
  currentProduct: OrgProduct | null;
}) {
  const isTrialExpired =
    currentProduct?.plan_tier === "trial" &&
    currentProduct.trial_ends_at &&
    new Date(currentProduct.trial_ends_at) <= new Date();

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
      <div className="max-w-md rounded-xl bg-card p-10 text-center shadow-lg">
        {isTrialExpired ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <Clock className="h-10 w-10" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-foreground">
              Kokeilujakso päättynyt
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              Rascal Mail -kokeilujaksosi on päättynyt. Päivitä tilauksesi
              jatkaaksesi palvelun käyttöä.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldX className="h-10 w-10" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-foreground">
              Ei käyttöoikeutta
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              Organisaatiollasi ei ole pääsyä Rascal Mail -tuotteeseen. Ota
              yhteyttä myyntiin aktivoidaksesi tuotteen.
            </p>
          </>
        )}
        <div className="flex flex-col items-center gap-3">
          <a
            href="https://www.rascal.fi/hinnat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowRight className="h-4 w-4" />
            Päivitä tilaus
          </a>
          <a
            href="mailto:info@rascal.fi"
            className="inline-flex items-center gap-2 rounded-lg bg-muted px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <Mail className="h-4 w-4" />
            Ota yhteyttä
          </a>
        </div>
      </div>
    </div>
  );
}
