import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn("p-8 md:p-12", className)}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-foreground">
          {title}
        </h2>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Steps list */}
          <div className="md:w-2/5 space-y-6">
            {features.map((feature, index) => (
              <button
                key={index}
                className="flex items-start gap-4 w-full text-left group"
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold transition-colors duration-300 border-2",
                    index <= currentFeature
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {index <= currentFeature ? "✓" : index + 1}
                </div>

                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-base font-semibold transition-colors duration-300",
                      index === currentFeature
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {feature.step}
                  </h3>
                  <h4
                    className={cn(
                      "text-sm font-medium mt-0.5 transition-colors duration-300",
                      index === currentFeature
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.content}
                  </p>

                  {/* Progress bar for active step */}
                  {index === currentFeature && (
                    <div className="h-1 w-full bg-muted rounded-full mt-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Image area */}
          <div className={cn("md:w-3/5 relative rounded-xl overflow-hidden", imageHeight)}>
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.title || feature.step}
                        className="w-full h-full object-cover rounded-xl shadow-lg"
                      />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
