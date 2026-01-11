import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Wand2, Layout, Palette, Image } from 'lucide-react';
import { LaneyMessage, PhotobookPage } from './types';

interface LaneyCompanionProps {
  currentPage: PhotobookPage | undefined;
  totalPages: number;
  onSuggestLayout: () => void;
  onSuggestCrop: () => void;
  onSuggestBackground: () => void;
}

const LANEY_MESSAGES: LaneyMessage[] = [
  {
    id: '1',
    message: 'Zal ik deze pagina mooier indelen?',
    type: 'suggestion',
    actionLabel: 'Bekijk suggestie'
  },
  {
    id: '2',
    message: 'Deze foto verdient een spread!',
    type: 'tip',
    actionLabel: 'Maak spread'
  },
  {
    id: '3',
    message: 'Wil je een rustiger layout proberen?',
    type: 'suggestion',
    actionLabel: 'Probeer layout'
  },
  {
    id: '4',
    message: 'Prachtig! Dit wordt een mooi boek ✨',
    type: 'praise'
  },
  {
    id: '5',
    message: 'Tip: Sleep foto\'s direct van onderaan naar het canvas',
    type: 'tip'
  },
  {
    id: '6',
    message: 'Deze pagina heeft veel potentie! Zal ik helpen?',
    type: 'suggestion',
    actionLabel: 'Help mij'
  }
];

export function LaneyCompanion({
  currentPage,
  totalPages,
  onSuggestLayout,
  onSuggestCrop,
  onSuggestBackground
}: LaneyCompanionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<LaneyMessage | null>(null);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  useEffect(() => {
    // Show Laney after a short delay when editor loads
    if (!hasShownInitial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentMessage(LANEY_MESSAGES[3]); // Start with praise
        setHasShownInitial(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasShownInitial]);

  useEffect(() => {
    // Rotate messages occasionally
    if (isVisible && !isMinimized) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * LANEY_MESSAGES.length);
        setCurrentMessage(LANEY_MESSAGES[randomIndex]);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isVisible, isMinimized]);

  const handleAction = () => {
    if (currentMessage?.type === 'suggestion') {
      onSuggestLayout();
    }
    setCurrentMessage(LANEY_MESSAGES[3]); // Show praise after action
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      >
        <div className="flex h-full w-full items-center justify-center">
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        </div>
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 border-2 border-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-72 animate-in slide-in-from-right-4">
      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Laney</p>
              <p className="text-[10px] text-muted-foreground">Je creatieve assistent</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(true)}
            >
              <div className="h-0.5 w-3 rounded-full bg-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Message */}
        <div className="p-4">
          <p className={cn(
            "text-sm",
            currentMessage?.type === 'praise' && "text-primary font-medium"
          )}>
            {currentMessage?.message}
          </p>

          {currentMessage?.actionLabel && (
            <Button
              size="sm"
              className="mt-3 w-full bg-gradient-to-r from-primary to-accent"
              onClick={handleAction}
            >
              <Wand2 className="mr-2 h-3 w-3" />
              {currentMessage.actionLabel}
            </Button>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 border-t border-border">
          <button
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            onClick={onSuggestLayout}
          >
            <Layout className="h-4 w-4" />
            Layout
          </button>
          <button
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-x border-border"
            onClick={onSuggestCrop}
          >
            <Image className="h-4 w-4" />
            Bijsnijden
          </button>
          <button
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            onClick={onSuggestBackground}
          >
            <Palette className="h-4 w-4" />
            Kleuren
          </button>
        </div>
      </div>
    </div>
  );
}
