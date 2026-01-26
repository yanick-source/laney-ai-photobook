import { useState, useEffect, useCallback } from "react";

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setHasConsented(true);
      } catch {
        setPreferences(defaultPreferences);
        setHasConsented(false);
      }
    } else {
      setPreferences(null);
      setHasConsented(false);
    }

    // Listen for storage changes (if user updates preferences in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cookie-consent" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CookiePreferences;
          setPreferences(parsed);
          setHasConsented(true);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updatePreferences = useCallback((newPreferences: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(newPreferences));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setPreferences(newPreferences);
    setHasConsented(true);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem("cookie-consent");
    localStorage.removeItem("cookie-consent-date");
    setPreferences(null);
    setHasConsented(false);
  }, []);

  return {
    preferences,
    hasConsented,
    updatePreferences,
    resetConsent,
    canUseAnalytics: preferences?.analytics ?? false,
    canUseFunctional: preferences?.functional ?? false,
    canUseMarketing: preferences?.marketing ?? false,
  };
}
