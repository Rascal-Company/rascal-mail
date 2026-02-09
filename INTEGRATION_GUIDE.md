# Rascal Mail Integration Guide

## Integrointi Rascal AI:hin

### 1. Luo OpenMailButton komponentti Rascal AI:hin

```jsx
// src/components/OpenMailButton.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export const OpenMailButton = ({ isCollapsed }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleOpenMail = async () => {
    setIsLoading(true);
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error(t("alerts.error.loginRequired"));
        return;
      }

      // Construct Mail URL based on environment
      const isDev = window.location.hostname === "localhost";
      const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || "yourdomain.com";

      const mailUrl = isDev
        ? "http://localhost:3001" // Rascal Mail dev port
        : `https://mail.${rootDomain}`;

      // Pass tokens via hash fragment (secure, not logged)
      const handoffUrl = `${mailUrl}/auth/handoff#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;

      // Open in new tab
      window.open(handoffUrl, "_blank");
    } catch (error) {
      console.error("Failed to open Rascal Mail:", error);
      toast.error(t("alerts.error.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={handleOpenMail}
        disabled={isLoading}
        className="group relative flex w-full items-center justify-center rounded-lg p-3 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        title={t("sidebar.mail")}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleOpenMail}
      disabled={isLoading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
    >
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <span className="font-medium">
        {isLoading ? t("sidebar.opening") : t("sidebar.mail")}
      </span>
    </button>
  );
};
```

### 2. Lisää Sidebar.jsx:ään

```jsx
import { OpenMailButton } from "./OpenMailButton";

// Sidebar-komponentissa, Tools-osion kohdalla:
{
  !isCollapsed && hasFeature("email") && (
    <div className="px-2">
      <OpenMailButton isCollapsed={isCollapsed} />
    </div>
  );
}
```

### 3. Lisää käännökset (fi.json, en.json)

```json
{
  "sidebar": {
    "mail": "Sähköpostimarkkinointi",
    "opening": "Avataan..."
  }
}
```

### 4. Lisää feature flag

```javascript
// Tietokannassa tai feature-configissa
features: {
  email: true; // tai perustuu käyttäjän tilaukseen
}
```

## Ympäristömuuttujat

### Rascal AI (.env):

```bash
VITE_ROOT_DOMAIN=yourdomain.com
```

### Rascal Mail (.env.local):

```bash
# Authentication Supabase (Rascal AI)
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://your-auth-project.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=your_auth_anon_key

# Data Supabase (Rascal Mail)
NEXT_PUBLIC_SUPABASE_URL=https://your-data-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_data_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Supabase Redirect URL -asetukset

Rascal AI Supabase → Authentication → URL Configuration:

```
Redirect URLs:
- http://localhost:3001/auth/handoff
- https://mail.yourdomain.com/auth/handoff
```

## Testaus

1. **Kehitysympäristö:**
   - Rascal AI: `http://localhost:3000`
   - Rascal Mail: `http://localhost:3001`

2. **Tuotanto:**
   - Rascal AI: `https://app.yourdomain.com`
   - Rascal Mail: `https://mail.yourdomain.com`

## Tietoturva

- ✅ Tokenin kulkee hash-fragmentissa (`#`) → ei näy server logeissa
- ✅ Handoff-sivu lukee tokenin ja kutsuu heti server actionia
- ✅ Token ei jää URL-historiaan
- ✅ HTTPS pakotettu tuotannossa
- ✅ Session validointi molemmissa päissä

## Flow-kaavio

```
User @ Rascal AI
    ↓ (clicks "Sähköpostimarkkinointi")
Gets current session
    ↓
Opens: https://mail.yourdomain.com/auth/handoff#tokens
    ↓
Handoff page extracts tokens
    ↓
Calls handleAuthHandoff(access_token, refresh_token)
    ↓
Server sets session
    ↓
Redirects to /dashboard
    ↓
User logged in! 🎉
```
