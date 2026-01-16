import { useState, useEffect } from 'react';
import { CheckCircle2, Save, Loader2 } from 'lucide-react';

export function AutoSaveIndicator() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSave = () => {
      setSaveStatus('saving');
      
      // Show saved status after a short delay
      timeoutId = setTimeout(() => {
        setSaveStatus('saved');
        
        // Return to idle after showing saved status
        timeoutId = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 500);
    };

    // Listen for custom save events
    window.addEventListener('autosave', handleSave);
    
    return () => {
      window.removeEventListener('autosave', handleSave);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (saveStatus === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm">
      {saveStatus === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Saving...</span>
        </>
      )}
      {saveStatus === 'saved' && (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">All changes saved</span>
        </>
      )}
    </div>
  );
}
