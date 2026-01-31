import { motion } from "framer-motion";
import { Upload, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import laneyMascot from "@/assets/laney-mascot.png";

const steps = [
  {
    icon: Upload,
    titleKey: "howItWorks.step1.title",
    titleFallback: "Upload photos",
    descKey: "howItWorks.step1.desc",
    descFallback: "Drag & drop your favorite memories",
    showMascot: false,
  },
  {
    icon: Sparkles,
    titleKey: "howItWorks.step2.title",
    titleFallback: "Laney creates magic",
    descKey: "howItWorks.step2.desc",
    descFallback: "Smart layouts & beautiful designs",
    showMascot: true,
  },
  {
    icon: BookOpen,
    titleKey: "howItWorks.step3.title",
    titleFallback: "Your photobook",
    descKey: "howItWorks.step3.desc",
    descFallback: "Review, customize & order",
    showMascot: false,
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
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">
                      {t(step.titleKey, step.titleFallback)}
                    </p>
                    {step.showMascot && (
                      <motion.img
                        src={laneyMascot}
                        alt="Laney mascot"
                        className="h-6 w-6 object-contain"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(step.descKey, step.descFallback)}
                  </p>
                </div>
              </motion.div>


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
