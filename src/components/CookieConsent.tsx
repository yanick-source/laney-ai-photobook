import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface CookiePreferences {
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

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptSelected = () => {
    savePreferences(preferences);
  };

  const rejectAll = () => {
    savePreferences(defaultPreferences);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('cookies.title', 'We use cookies')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.subtitle', 'To improve your experience')}
                  </p>
                </div>
              </div>
              <button
                onClick={rejectAll}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-muted-foreground">
              {t('cookies.description', 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.')}
              {" "}
              <Link to="/cookies" className="text-primary hover:underline">
                {t('cookies.learnMore', 'Learn more')}
              </Link>
            </p>

            {/* Toggle details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {showDetails ? (
                <>
                  {t('cookies.hideDetails', 'Hide details')}
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t('cookies.showDetails', 'Manage preferences')}
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Preferences */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-4">
                    {/* Essential */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('cookies.essential.title', 'Essential')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('cookies.essential.description', 'Required for basic site functionality')}
                        </p>
                      </div>
                      <Switch checked disabled className="opacity-50" />
                    </div>

                    {/* Functional */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('cookies.functional.title', 'Functional')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('cookies.functional.description', 'Remember your preferences')}
                        </p>
                      </div>
                      <Switch
                        checked={preferences.functional}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, functional: checked })
                        }
                      />
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('cookies.analytics.title', 'Analytics')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('cookies.analytics.description', 'Help us improve our website')}
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, analytics: checked })
                        }
                      />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('cookies.marketing.title', 'Marketing')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('cookies.marketing.description', 'Personalized advertisements')}
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, marketing: checked })
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={rejectAll} className="w-full sm:w-auto">
                {t('cookies.rejectAll', 'Reject all')}
              </Button>
              {showDetails && (
                <Button variant="outline" onClick={acceptSelected} className="w-full sm:w-auto">
                  {t('cookies.savePreferences', 'Save preferences')}
                </Button>
              )}
              <Button onClick={acceptAll} className="w-full sm:w-auto gradient-bg">
                {t('cookies.acceptAll', 'Accept all')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
