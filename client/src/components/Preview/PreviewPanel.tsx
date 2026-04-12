import { ExternalLink, RefreshCw, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  url?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onStop?: () => void;
}

export default function PreviewPanel({ url, isLoading, onRefresh, onStop }: PreviewPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/40 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                {url || "Waiting for dev server..."}
            </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {url && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(url, '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onStop}>
            <StopCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Frame */}
      <div className="flex-1 bg-white relative">
        {url ? (
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            title="Project Preview"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <RefreshCw className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">Start the dev server to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
