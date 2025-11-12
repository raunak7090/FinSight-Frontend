import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ApiConnectionNotice() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Connection Required</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="text-sm">
            The app needs to connect to your backend at:
          </p>
          <code className="block text-xs bg-destructive-foreground/10 p-2 rounded">
            {apiUrl}
          </code>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/API_CONNECTION_GUIDE.md', '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
