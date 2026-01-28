import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import messyPhotosCollage from "@/assets/General/messy-photos-collage.png";

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
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left side - The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="relative order-2 md:order-1"
          >
            {/* Messy photos collage image */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 z-10" />
              <motion.img
                src={messyPhotosCollage}
                alt="Messy photo collage representing overwhelming camera roll"
                className="w-full h-48 md:h-56 object-cover rounded-2xl opacity-60 grayscale"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="relative z-20">
              <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground leading-tight mb-8 tracking-tight">
                {t("problemSolution.problem.headline")}
              </h2>

              <ul className="space-y-4 mb-8">
                {problemPoints.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-2.5 flex-shrink-0" />
                    <span className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                      {point}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-base md:text-lg text-muted-foreground/80 italic border-l-4 border-primary/30 pl-5 py-1"
              >
                {t("problemSolution.problem.transition")}
              </motion.p>
            </div>
          </motion.div>

          {/* Right side - The Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative order-1 md:order-2"
          >
            <div className="relative z-10 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-border/60 shadow-xl shadow-primary/5">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
              
              <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground leading-tight mb-10 tracking-tight relative z-10">
                {t("problemSolution.solution.headline")}
              </h2>

              {/* Solution flow */}
              <div className="flex flex-col gap-5 mb-8 relative z-10">
                {solutionSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                    className="flex items-center gap-4 group"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </span>
                    <span className="text-lg md:text-xl text-foreground font-medium flex-1">
                      {step}
                    </span>
                    {index < solutionSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-primary/50 hidden sm:block" />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-3 bg-primary/5 rounded-xl px-5 py-4 relative z-10"
              >
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-lg md:text-xl text-foreground font-semibold">
                  {t("problemSolution.solution.supporting")}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
