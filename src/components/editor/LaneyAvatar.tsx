import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaneyAvatarProps {
  onSendPrompt: (prompt: string) => void;
  isProcessing?: boolean;
}

export function LaneyAvatar({ onSendPrompt, isProcessing = false }: LaneyAvatarProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (prompt.trim() && !isProcessing) {
      onSendPrompt(prompt);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Avatar - Always Visible */}
      <div className="fixed right-6 top-24 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            'group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl',
            isChatOpen && 'scale-110 shadow-xl'
          )}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-50 blur-xl transition-opacity group-hover:opacity-75" />
          
          {/* Icon */}
          <Sparkles className="relative h-6 w-6 text-white" />
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        </button>

        {/* Tooltip */}
        {!isChatOpen && (
          <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Ask Laney for help
          </div>
        )}
      </div>

      {/* Chat Overlay - Slides Down from Top */}
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Chat Panel */}
          <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="mx-4 overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Laney AI</h3>
                    <p className="text-xs text-muted-foreground">Your creative director</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions */}
              <div className="border-b border-border/50 bg-gray-50/50 px-6 py-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Improve this page layout',
                    'Suggest a better photo arrangement',
                    'Add a title to this page',
                    'Make this page more balanced',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary hover:bg-primary/5"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to change on this page..."
                    className="min-h-[120px] resize-none rounded-xl border-2 border-border bg-white pr-12 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!prompt.trim() || isProcessing}
                    size="icon"
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info Text */}
                <p className="mt-3 text-xs text-muted-foreground">
                  Laney will analyze your current page and make intelligent improvements.
                  Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to send.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
