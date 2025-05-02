"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", errorHandler)
    
    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-[300px] p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-4">
          An error occurred while loading this component
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setHasError(false)
            setError(null)
            window.location.reload()
          }}
          className="bg-white border-red-300 text-red-700 hover:bg-red-100"
        >
          Try again
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
