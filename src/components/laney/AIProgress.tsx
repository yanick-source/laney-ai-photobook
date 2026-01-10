import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description: string;
}

const steps: Step[] = [
  { label: "Foto's analyseren", description: "AI bekijkt je foto's" },
  { label: "Layout creëren", description: "Optimale pagina indeling" },
  { label: "Tekst genereren", description: "Titels en onderschriften" },
  { label: "Design finaliseren", description: "Laatste touches toevoegen" },
];

interface AIProgressProps {
  onComplete: () => void;
  isProcessing: boolean;
}

export function AIProgress({ onComplete, isProcessing }: AIProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const stepDuration = 2500; // 2.5s per step
    const progressInterval = 50;
    const progressIncrement = 100 / (stepDuration / progressInterval);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            clearInterval(interval);
            onComplete();
            return 100;
          }
        }
        return next;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [isProcessing, currentStep, onComplete]);

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
          <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">AI is bezig...</h2>
        <p className="mt-2 text-muted-foreground">
          {steps[currentStep]?.description}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 transition-all duration-300",
                isComplete
                  ? "border-green-200 bg-green-50"
                  : isCurrent
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  isComplete
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isComplete
                      ? "text-green-700"
                      : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
