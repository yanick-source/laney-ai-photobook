import { useTranslation } from "react-i18next";
import { Header } from "@/components/laney/Header";
import { Footer } from "@/components/laney/Footer";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          {t("legal.privacy.title", "Privacy Policy")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("legal.lastUpdated", "Last updated")}: January 25, 2026
        </p>

        <div className="prose prose-stone max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {t("legal.privacy.introduction", "Introduction")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Laney. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our photobook creation service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {t("legal.privacy.dataCollection", "Data We Collect")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Name and email address when you create an account</li>
              <li>Photos you upload to create your photobooks</li>
              <li>Shipping address for order delivery</li>
              <li>Payment information (processed securely by our payment providers)</li>
              <li>Communication preferences and feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. {t("legal.privacy.howWeUse", "How We Use Your Data")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Create and deliver your personalized photobooks</li>
              <li>Process payments and send order confirmations</li>
              <li>Improve our AI-powered design features</li>
              <li>Send you updates about your orders and our services</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. {t("legal.privacy.photoSecurity", "Photo Security")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your photos are precious memories, and we treat them with the utmost care. All uploaded photos are encrypted 
              in transit and at rest. We never share your photos with third parties, and you can delete them at any time. 
              Photos are automatically removed from our servers 30 days after your order is completed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. {t("legal.privacy.yourRights", "Your Rights")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR and other privacy regulations, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. {t("legal.privacy.contact", "Contact Us")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
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

export default PrivacyPolicy;
