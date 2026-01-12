import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles, Undo2, X } from "lucide-react";

interface PageAIPromptBarProps {
  isOpen: boolean;
  prompt: string;
  isRunning: boolean;
  canUndo: boolean;
  canRegenerate: boolean;
  onPromptChange: (next: string) => void;
  onRun: () => void;
  onRegenerate: () => void;
  onUndo: () => void;
  onClose: () => void;
}

export function PageAIPromptBar({
  isOpen,
  prompt,
  isRunning,
  canUndo,
  canRegenerate,
  onPromptChange,
  onRun,
  onRegenerate,
  onUndo,
  onClose,
}: PageAIPromptBarProps) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-start gap-3">
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1">
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder='Make this page have a more summery vibe.'
            className="min-h-[44px] resize-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Tip: vraag om stijl, betere compositie, slimmere crops, tekstverbetering of een quote — alleen voor deze pagina.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", !canUndo && "opacity-50")}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", (!canRegenerate || isRunning) && "opacity-50")}
            onClick={onRegenerate}
            disabled={!canRegenerate || isRunning}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            onClick={onRun}
            disabled={isRunning || prompt.trim().length === 0}
          >
            <Sparkles className="h-4 w-4" />
            {isRunning ? "Bezig..." : "Toepassen"}
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
