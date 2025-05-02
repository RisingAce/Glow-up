// This component has been deprecated since API keys are now managed through 
// environment variables on the server, which is more secure.
// This file is kept as a reference but is no longer used in the application.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"

// This component is no longer used in the application
export function ApiKeyDialog() {
  return null; // Component removed
}

// These functions are no longer used
export function getLocalApiKey(): string | null {
  return null;
}

export function saveLocalApiKey(_key: string): void {
  // No longer used
}

export function clearLocalApiKey(): void {
  // No longer used
}
