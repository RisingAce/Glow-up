export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold tracking-tighter text-primary">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Page Not Found - Check Your Meter',
  description: 'Sorry, we couldn\'t find the page you\'re looking for.',
};
