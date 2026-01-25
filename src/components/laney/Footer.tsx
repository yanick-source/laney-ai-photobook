import { useTranslation } from "react-i18next";
import { Leaf, Mail, MapPin } from "lucide-react";

// Payment method icons as simple SVG components
const PaymentIcons = {
  Visa: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path d="M19.5 21H17L18.9 11H21.4L19.5 21Z" fill="white" />
      <path d="M28.7 11.2C28.2 11 27.4 10.8 26.4 10.8C23.9 10.8 22.2 12.1 22.2 13.9C22.2 15.3 23.4 16 24.4 16.5C25.4 17 25.7 17.3 25.7 17.8C25.7 18.5 24.9 18.8 24.1 18.8C23 18.8 22.4 18.6 21.5 18.2L21.1 18L20.7 20.6C21.4 20.9 22.6 21.2 23.9 21.2C26.6 21.2 28.2 19.9 28.2 18C28.2 16.9 27.5 16.1 26 15.4C25.1 15 24.6 14.7 24.6 14.2C24.6 13.8 25 13.3 26 13.3C26.9 13.3 27.5 13.5 28 13.7L28.3 13.8L28.7 11.2Z" fill="white" />
      <path d="M32.8 11H30.8C30.2 11 29.7 11.2 29.5 11.8L25.7 21H28.4L28.9 19.5H32.2L32.5 21H35L32.8 11ZM29.6 17.5C29.8 17 30.8 14.3 30.8 14.3C30.8 14.3 31.1 13.5 31.2 13L31.4 14.2C31.4 14.2 32 17 32.1 17.5H29.6Z" fill="white" />
      <path d="M16.2 11L13.7 17.8L13.4 16.3C12.9 14.7 11.4 13 9.7 12.1L12 21H14.7L18.9 11H16.2Z" fill="white" />
      <path d="M12 11H8L8 11.2C11.2 12 13.4 14 14.2 16.3L13.3 11.8C13.2 11.2 12.7 11 12 11Z" fill="#F9A51A" />
    </svg>
  ),
  Mastercard: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <circle cx="18" cy="16" r="8" fill="#EB001B" />
      <circle cx="30" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.5C25.8 12 27 14.3 27 16.9C27 19.5 25.8 21.8 24 23.3C22.2 21.8 21 19.5 21 16.9C21 14.3 22.2 12 24 10.5Z" fill="#FF5F00" />
    </svg>
  ),
  Amex: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <path d="M8 16L10 12H13L14 14L15 12H18L16 16L18 20H15L14 18L13 20H10L8 16Z" fill="white" />
      <path d="M20 12H26V14H22V15H26V17H22V18H26V20H20V12Z" fill="white" />
      <path d="M28 12H32L33 14L34 12H38L35 16L38 20H34L33 18L32 20H28L31 16L28 12Z" fill="white" />
    </svg>
  ),
  PayPal: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <path d="M18.5 8H23.5C26.5 8 28 9.5 27.5 12C27 15 24.5 17 21.5 17H19.5L18.5 22H15L18.5 8Z" fill="#003087" />
      <path d="M20 10H23C24.5 10 25.5 11 25.2 12.5C24.9 14.5 23.5 15.5 22 15.5H20.5L20 10Z" fill="#009CDE" />
      <path d="M28 12H33C36 12 37.5 13.5 37 16C36.5 19 34 21 31 21H29L28 26H24.5L28 12Z" fill="#003087" />
      <path d="M29.5 14H32.5C34 14 35 15 34.7 16.5C34.4 18.5 33 19.5 31.5 19.5H30L29.5 14Z" fill="#009CDE" />
    </svg>
  ),
  iDeal: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#CC0066" />
      <circle cx="24" cy="16" r="8" fill="white" />
      <circle cx="24" cy="16" r="4" fill="#CC0066" />
    </svg>
  ),
  Bancontact: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#005498" />
      <rect x="8" y="10" width="14" height="12" rx="2" fill="#FFD800" />
      <rect x="26" y="10" width="14" height="12" rx="2" fill="white" />
    </svg>
  ),
  ApplePay: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#000" />
      <path d="M15 11C15.5 10.3 15.8 9.4 15.7 8.5C14.9 8.5 13.9 9 13.4 9.7C12.9 10.3 12.5 11.2 12.6 12C13.5 12.1 14.4 11.6 15 11Z" fill="white" />
      <path d="M15.7 12.2C14.3 12.1 13.1 13 12.4 13C11.7 13 10.7 12.2 9.5 12.3C8 12.3 6.6 13.1 5.8 14.4C4.2 17 5.4 20.8 6.9 23C7.7 24.1 8.6 25.3 9.8 25.3C11 25.2 11.4 24.5 12.8 24.5C14.2 24.5 14.6 25.3 15.8 25.2C17.1 25.2 17.9 24.1 18.6 23C19.4 21.8 19.8 20.6 19.8 20.6C19.8 20.5 17.5 19.6 17.5 17C17.5 14.7 19.3 13.7 19.4 13.6C18.3 12 16.7 12.2 15.7 12.2Z" fill="white" />
      <text x="23" y="20" fill="white" fontSize="8" fontFamily="Arial" fontWeight="600">Pay</text>
    </svg>
  ),
  GooglePay: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <path d="M24 12.5V19.5H22V12.5H24Z" fill="#4285F4" />
      <path d="M28.5 14.5C28.5 13.4 27.6 12.5 26.5 12.5H24V14.5H26.5V17.5H24V19.5H26.5C27.6 19.5 28.5 18.6 28.5 17.5V14.5Z" fill="#4285F4" />
      <path d="M19 14.5H16.5V12.5H19C20.1 12.5 21 13.4 21 14.5V15.5C21 16.1 20.7 16.6 20.2 16.9L21 19.5H18.8L18.1 17.5H16.5V19.5H14.5V12.5H19C20.1 12.5 21 13.4 21 14.5Z" fill="#EA4335" />
      <circle cx="34" cy="16" r="4" fill="#34A853" />
      <path d="M34 13V16H37C37 14.3 35.7 13 34 13Z" fill="#FBBC05" />
    </svg>
  ),
};

export function Footer() {
  const { t } = useTranslation();

  const paymentMethods = [
    "Visa",
    "Mastercard",
    "Amex",
    "PayPal",
    "iDeal",
    "Bancontact",
    "ApplePay",
    "GooglePay",
  ] as const;

  return (
    <footer className="bg-card border-t border-border/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand & Sustainability */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">Laney</h3>
            <div className="flex items-start gap-3 text-muted-foreground">
              <Leaf className="w-5 h-5 text-laney-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                {t("footer.sustainability")}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("footer.contact")}
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:hello@laney.app" className="hover:text-foreground transition-colors">
                  hello@laney.app
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Amsterdam, Netherlands</span>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.cookiePolicy")}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.termsConditions")}
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("footer.paymentMethods")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => {
                const Icon = PaymentIcons[method];
                return (
                  <div
                    key={method}
                    className="bg-background rounded-md p-1.5 border border-border/50"
                    title={method}
                  >
                    <Icon />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Laney. {t("footer.allRightsReserved")}</p>
            <p className="text-center md:text-right">
              {t("footer.madeWith")} ❤️ {t("footer.inAmsterdam")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
