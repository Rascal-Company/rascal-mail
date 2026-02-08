'use client';

import { OrgSwitcher } from './OrgSwitcher';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <OrgSwitcher />
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
