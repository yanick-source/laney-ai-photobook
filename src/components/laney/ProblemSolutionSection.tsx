import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const ProblemSolutionSection = () => {
  const { t } = useTranslation();

  const problemPoints = [
    t("problemSolution.problem.point1"),
    t("problemSolution.problem.point2"),
    t("problemSolution.problem.point3"),
    t("problemSolution.problem.point4"),
  ];

  const solutionSteps = [
    t("problemSolution.solution.step1"),
    t("problemSolution.solution.step2"),
    t("problemSolution.solution.step3"),
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Left side - The Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Subtle messy grid background */}
            <div className="absolute -top-4 -left-4 w-32 h-32 opacity-10">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted-foreground/50 rounded-sm"
                    style={{
                      transform: `rotate(${Math.random() * 6 - 3}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-muted-foreground/80 leading-tight mb-6">
                {t("problemSolution.problem.headline")}
              </h2>

              <ul className="space-y-3 mb-6">
                {problemPoints.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3 text-muted-foreground/70"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2.5 flex-shrink-0" />
                    <span className="text-base md:text-lg leading-relaxed">{point}</span>
                  </motion.li>
                ))}
              </ul>

              <p className="text-sm md:text-base text-muted-foreground/60 italic border-l-2 border-muted-foreground/20 pl-4">
                {t("problemSolution.problem.transition")}
              </p>
            </div>
          </motion.div>

          {/* Right side - The Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Clean photobook preview background */}
            <div className="absolute -top-4 -right-4 w-40 h-40 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 rounded-lg shadow-2xl transform rotate-3" />
            </div>

            <div className="relative z-10 bg-card/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mb-8">
                {t("problemSolution.solution.headline")}
              </h2>

              {/* Solution flow */}
              <div className="flex flex-col gap-4 mb-6">
                {solutionSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-base md:text-lg text-foreground/90">{step}</span>
                    {index < solutionSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 ml-auto hidden sm:block" />
                    )}
                  </motion.div>
                ))}
              </div>

              <p className="text-base md:text-lg text-muted-foreground font-medium">
                {t("problemSolution.solution.supporting")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
