'use client'; // Error components must be Client Components

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="space-y-6 max-w-md">
        <h1 className="text-5xl font-bold tracking-tighter text-primary">Something went wrong!</h1>
        <p className="text-muted-foreground">
          We're sorry, but there was an error processing your request.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={reset}
            variant="default" 
            size="lg"
          >
            Try again
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg"
          >
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
