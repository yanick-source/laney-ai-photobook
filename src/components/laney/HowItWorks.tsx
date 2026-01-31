import { motion } from "framer-motion";
import { Upload, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const steps = [
  {
    icon: Upload,
    titleKey: "howItWorks.step1.title",
    titleFallback: "Upload photos",
    descKey: "howItWorks.step1.desc",
    descFallback: "Drag & drop your favorite memories",
  },
  {
    icon: Sparkles,
    titleKey: "howItWorks.step2.title",
    titleFallback: "AI creates magic",
    descKey: "howItWorks.step2.desc",
    descFallback: "Smart layouts & beautiful designs",
  },
  {
    icon: BookOpen,
    titleKey: "howItWorks.step3.title",
    titleFallback: "Your photobook",
    descKey: "howItWorks.step3.desc",
    descFallback: "Review, customize & order",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-8 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
          {steps.map((step, index) => (
            <div key={step.titleKey} className="flex items-center gap-2 sm:gap-2">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
              >
                {/* Icon circle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-md">
                  <step.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                
                {/* Text */}
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {t(step.titleKey, step.titleFallback)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(step.descKey, step.descFallback)}
                  </p>
                </div>
              </motion.div>

              {/* Arrow connector (not after last item) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden sm:flex mx-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1, duration: 0.3 }}
                >
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
