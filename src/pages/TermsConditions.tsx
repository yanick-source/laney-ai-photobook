import { useTranslation } from "react-i18next";
import { Header } from "@/components/laney/Header";
import { Footer } from "@/components/laney/Footer";

const TermsConditions = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          {t("legal.terms.title", "Terms & Conditions")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("legal.lastUpdated", "Last updated")}: January 25, 2026
        </p>

        <div className="prose prose-stone max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. {t("legal.terms.acceptance", "Acceptance of Terms")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Laney's photobook creation service, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. {t("legal.terms.serviceDescription", "Service Description")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Laney provides an AI-powered photobook creation platform that allows users to upload photos, 
              design custom photobooks, and order printed copies. Our service includes intelligent photo analysis, 
              automatic layout suggestions, and professional printing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. {t("legal.terms.userContent", "User Content")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain all ownership rights to the photos and content you upload. By using our service, you grant us 
              a limited license to process, store, and print your content solely for the purpose of fulfilling your orders.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for ensuring that your content does not violate any laws or third-party rights. 
              We reserve the right to refuse printing content that is illegal, offensive, or violates intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. {t("legal.terms.ordersPayment", "Orders and Payment")}
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All prices are displayed in Euros and include applicable taxes</li>
              <li>Payment is required at the time of order placement</li>
              <li>We accept major credit cards, iDeal, PayPal, and other payment methods</li>
              <li>Orders are confirmed via email once payment is processed</li>
              <li>Shipping costs are calculated based on delivery location and displayed before checkout</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. {t("legal.terms.shipping", "Shipping and Delivery")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We aim to produce and ship your photobook within 5-7 business days. Delivery times vary by location:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Netherlands: 1-2 business days after shipping</li>
              <li>Belgium & Germany: 2-3 business days after shipping</li>
              <li>Rest of Europe: 3-5 business days after shipping</li>
              <li>International: 5-10 business days after shipping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. {t("legal.terms.returnsRefunds", "Returns and Refunds")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Because each photobook is custom-made with your personal photos, we cannot accept returns for change of mind. 
              However, we stand behind the quality of our products:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>If your photobook arrives damaged, contact us within 14 days for a free replacement</li>
              <li>If there's a printing error on our part, we'll reprint and ship at no cost</li>
              <li>Quality issues are assessed on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. {t("legal.terms.intellectualProperty", "Intellectual Property")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Laney platform, including its design, features, and technology, is protected by intellectual property laws. 
              You may not copy, modify, or distribute any part of our service without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. {t("legal.terms.liability", "Limitation of Liability")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Laney is not liable for any indirect, incidental, or consequential damages arising from the use of our service. 
              Our total liability is limited to the amount paid for the specific order in question.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. {t("legal.terms.changes", "Changes to Terms")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms and Conditions from time to time. Continued use of our service after changes 
              constitutes acceptance of the new terms. We will notify users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. {t("legal.terms.contact", "Contact Information")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms and Conditions, please contact us at{" "}
              <a href="mailto:support@laney.com" className="text-primary hover:underline">
                support@laney.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. {t("legal.terms.governingLaw", "Governing Law")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms and Conditions are governed by the laws of the Netherlands. Any disputes will be resolved 
              in the courts of Amsterdam, the Netherlands.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
