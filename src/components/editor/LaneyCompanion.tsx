import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Wand2, Layout, Palette, Image, Type, Lightbulb } from 'lucide-react';
import { LaneyMessage, PhotobookPage } from './types';

interface LaneyCompanionProps {
  currentPage: PhotobookPage | undefined;
  totalPages: number;
  onSuggestLayout: () => void;
  onSuggestBackground: () => void;
  onAddText: () => void;
}

const LANEY_MESSAGES: LaneyMessage[] = [
  {
    id: '1',
    message: 'Want me to suggest a better layout for this page?',
    type: 'suggestion',
    actionLabel: 'View suggestions',
  },
  {
    id: '2',
    message: 'This photo deserves a full spread!',
    type: 'tip',
    actionLabel: 'Try it',
  },
  {
    id: '3',
    message: 'Try a calmer layout for better visual flow.',
    type: 'suggestion',
    actionLabel: 'Show layouts',
  },
  {
    id: '4',
    message: "Beautiful! This is going to be a stunning book ✨",
    type: 'praise',
  },
  {
    id: '5',
    message: 'Tip: Drag photos from the tray directly onto the canvas',
    type: 'tip',
  },
  {
    id: '6',
    message: 'This page has great potential! Need help?',
    type: 'suggestion',
    actionLabel: 'Help me',
  },
  {
    id: '7',
    message: 'Add a caption to tell the story behind this moment.',
    type: 'tip',
    actionLabel: 'Add text',
  },
];

export function LaneyCompanion({
  currentPage,
  totalPages,
  onSuggestLayout,
  onSuggestBackground,
  onAddText,
}: LaneyCompanionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentMessage, setCurrentMessage] = useState<LaneyMessage | null>(null);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  useEffect(() => {
    if (!hasShownInitial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentMessage(LANEY_MESSAGES[3]);
        setHasShownInitial(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasShownInitial]);

  useEffect(() => {
    if (isVisible && !isMinimized) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * LANEY_MESSAGES.length);
        setCurrentMessage(LANEY_MESSAGES[randomIndex]);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [isVisible, isMinimized]);

  const handleAction = () => {
    if (!currentMessage) return;
    
    if (currentMessage.message.toLowerCase().includes('layout')) {
      onSuggestLayout();
    } else if (currentMessage.message.toLowerCase().includes('text') || currentMessage.message.toLowerCase().includes('caption')) {
      onAddText();
    } else {
      onSuggestLayout();
    }
    setCurrentMessage(LANEY_MESSAGES[3]);
  };

  if (!isVisible) return null;

  // Minimized state - floating avatar
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg transition-all hover:scale-110 hover:shadow-xl animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10" />
        {/* Notification dot */}
        <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-yellow-400" />
      </button>
    );
  }

  // Expanded state
  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 animate-in slide-in-from-right-4 zoom-in-95 duration-300">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Laney</p>
              <p className="text-[10px] text-muted-foreground">Your creative partner</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/50"
              onClick={() => setIsMinimized(true)}
            >
              <div className="h-0.5 w-3 rounded-full bg-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/50"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Message */}
        <div className="p-4">
          <div className="flex gap-2">
            <Lightbulb className={cn(
              "mt-0.5 h-4 w-4 flex-shrink-0",
              currentMessage?.type === 'praise' ? 'text-yellow-500' : 'text-primary'
            )} />
            <p
              className={cn(
                'text-sm leading-relaxed',
                currentMessage?.type === 'praise' && 'font-medium text-primary'
              )}
            >
              {currentMessage?.message}
            </p>
          </div>

          {currentMessage?.actionLabel && (
            <Button
              size="sm"
              className="mt-3 w-full bg-gradient-to-r from-primary to-accent shadow-md"
              onClick={handleAction}
            >
              <Wand2 className="mr-2 h-3 w-3" />
              {currentMessage.actionLabel}
            </Button>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 border-t border-border/50">
          <button
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={onSuggestLayout}
          >
            <Layout className="h-4 w-4" />
            Layouts
          </button>
          <button
            className="flex flex-col items-center gap-1 border-x border-border/50 py-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={onAddText}
          >
            <Type className="h-4 w-4" />
            Text
          </button>
          <button
            className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={onSuggestBackground}
          >
            <Palette className="h-4 w-4" />
            Colors
          </button>
        </div>
      </div>
    </div>
  );
}
