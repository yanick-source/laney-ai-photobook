import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { trackPageView, trackEvent, initAnalytics } from "@/lib/analytics";

interface AnalyticsContextValue {
  trackEvent: typeof trackEvent;
  canTrack: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const { canUseAnalytics, hasConsented } = useCookieConsent();

  // Initialize analytics when consent is given
  useEffect(() => {
    if (hasConsented && canUseAnalytics) {
      initAnalytics();
    }
  }, [hasConsented, canUseAnalytics]);

  // Track page views on route change
  useEffect(() => {
    if (canUseAnalytics) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, canUseAnalytics]);

  const value: AnalyticsContextValue = {
    trackEvent: canUseAnalytics ? trackEvent : () => {},
    canTrack: canUseAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  
  // Return no-op functions if used outside provider
  if (!context) {
    return {
      trackEvent: () => {},
      canTrack: false,
    };
  }
  
  return context;
}
