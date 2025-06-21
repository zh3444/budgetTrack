import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export function GlobalLoader({ isLoading, message = "Loading...", overlay = true, className }) {
  if (!isLoading) return null

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  )

  if (overlay) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className,
        )}
      >
        <Card className="shadow-lg">{loaderContent}</Card>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center w-full h-full", className)}>
      <Card className="shadow-lg">{loaderContent}</Card>
    </div>
  )
}