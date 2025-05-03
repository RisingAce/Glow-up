import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold tracking-tighter text-primary">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Metadata for the 404 page
export const metadata = {
  title: 'Page Not Found - Check Your Meter',
  description: 'Sorry, we couldn\'t find the page you\'re looking for.',
};
