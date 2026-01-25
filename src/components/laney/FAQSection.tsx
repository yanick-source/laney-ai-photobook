import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  { key: "howLong" },
  { key: "designSkills" },
  { key: "photoPrivacy" },
  { key: "editAfter" },
  { key: "shipping" },
  { key: "satisfaction" },
];

export function FAQSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("faq.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.key}
                value={item.key}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:bg-accent/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 text-base md:text-lg font-medium">
                  {t(`faq.items.${item.key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {t(`faq.items.${item.key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
