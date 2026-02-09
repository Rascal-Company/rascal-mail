"use client";

import { OrgSwitcher } from "./OrgSwitcher";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-rascal-dark-alt bg-rascal-dark px-6 text-white">
      <div className="flex items-center gap-4">
        <OrgSwitcher />
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
