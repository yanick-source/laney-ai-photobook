import { useTranslation } from "react-i18next";
import { Header } from "@/components/laney/Header";
import { Footer } from "@/components/laney/Footer";

const CookiePolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          {t("legal.cookies.title", "Cookie Policy")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("legal.lastUpdated", "Last updated")}: January 25, 2026
        </p>

        <div className="prose prose-stone max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {t("legal.cookies.whatAreCookies", "What Are Cookies")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {t("legal.cookies.typesWeUse", "Types of Cookies We Use")}
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, account access, and remembering items in your cart.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Functional Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies remember your preferences, such as language settings and display options, 
                  to provide a more personalized experience.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use analytics cookies to understand how visitors interact with our website. 
                  This helps us improve our service and user experience. All data is anonymized.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Marketing Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With your consent, we may use marketing cookies to show you relevant advertisements 
                  and measure the effectiveness of our campaigns.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. {t("legal.cookies.managingCookies", "Managing Cookies")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
              <li>Our cookie banner: You can adjust your preferences when you first visit our site</li>
              <li>Opt-out links: For third-party analytics, you can use their opt-out mechanisms</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please note that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. {t("legal.cookies.thirdParty", "Third-Party Cookies")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use trusted third-party services that may set cookies on your device. These include payment processors 
              for secure transactions and analytics providers to help us improve our service. Each third party has their 
              own privacy and cookie policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. {t("legal.cookies.updates", "Updates to This Policy")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
              We will notify you of any significant changes by posting a notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. {t("legal.cookies.contact", "Contact Us")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{" "}
              <a href="mailto:privacy@laney.com" className="text-primary hover:underline">
                privacy@laney.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
