"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Camera, 
  Upload, 
  X, 
  AlertTriangle, 
  Globe, 
  Info, 
  Download, 
  Sparkles, 
  Zap, 
  Phone,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MeterAnalysisResult } from "../types/meter-types"

const MORE_INFO_FEEDBACK = "Please take a clearer photo of the meter, ensuring the entire meter is visible and in focus.";

const BetterImageNeeded = ({ message, onReset, hasCamera, onStartCamera }: { 
  message: string; 
  onReset: () => void;
  hasCamera: boolean;
  onStartCamera: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="my-6"
  >
    <Card className="border-red-300 bg-red-50">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800 text-lg">More Information Needed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-red-700">{message}</p>
        
        <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
          <h4 className="text-sm font-medium text-red-800 mb-1">Photo Tips:</h4>
          <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
            <li>Ensure the entire meter is visible in the frame</li>
            <li>Capture any model numbers or labels clearly</li>
            <li>Include some of the surroundings (where the meter is installed)</li>
            <li>Take the photo in good lighting</li>
            <li>Hold the camera steady to avoid blur</li>
          </ul>
        </div>
        
        <div className="flex mt-4 gap-3">
          {hasCamera && (
            <Button 
              onClick={onStartCamera}
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take New Photo
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onReset}
            className="border-red-300 text-red-700 hover:bg-red-100 flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Different Image
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function MeterUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MeterAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [imageQualityWarning, setImageQualityWarning] = useState<string | null>(null) // State for non-blocking quality warnings
  
  const [dragActive, setDragActive] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  // Removed uploadProgress as it wasn't fully implemented and analysisPhase provides better context
  const [analysisPhase, setAnalysisPhase] = useState<string | null>(null) // e.g., 'Uploading', 'Enhancing', 'Analyzing'
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [hasCamera, setHasCamera] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()

  // Handle errors for camera and media access
  const handleError = (error: Event) => {
    console.error("An error occurred:", error);
    
    if (showCamera) {
      toast({
        title: "Camera Error",
        description: "There was an error accessing your camera. Please try uploading an image instead.",
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false))
    
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        // Removed uploadProgress updates as it's not fully implemented
      }, 300);
    } else {
      // Removed uploadProgress reset as it's not fully implemented
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null) // Clear errors on new file selection
    setResult(null) // Clear previous results
    setImageQualityWarning(null)
    setAnalysisPhase(null)

    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage("File size exceeds 5MB. Please upload a smaller image.")
        setFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
        setErrorMessage("Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.")
        setFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }

      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)
    setImageQualityWarning(null)
    setAnalysisPhase('Uploading') // Set initial phase

    try {
      // Check for potential quality issues *before* submitting if possible
      // (Simple client-side checks could go here if desired, e.g., resolution)
      
      // --- Image Upscaling (Optional) ---
      let imageToAnalyze = file;
      let wasImageUpscaled = false;
      // Optional: Decide if upscaling is needed based on file size/dimensions
      // For simplicity, we'll attempt upscale if it seems small, but the API handles quality checks robustly.
      // A more sophisticated check might look at image dimensions.
      if (file.size < 150 * 1024) { // Example: Try upscale for images under 150KB
         setAnalysisPhase('Enhancing image');
         const upscaledFile = await upscaleImage(file);
         if (upscaledFile) {
             imageToAnalyze = upscaledFile;
             wasImageUpscaled = true;
         } // else: continue with original if upscale fails
      }

      // --- API Call ---
      setAnalysisPhase('Analyzing with AI') // Update phase
      const formData = new FormData()
      formData.append('image', imageToAnalyze)
      formData.append('wasImageUpscaled', String(wasImageUpscaled)); // Inform API if upscaled

      const response = await fetch('/api/checkMeter', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) // Gracefully handle non-JSON errors
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`)
      }

      const analysis: MeterAnalysisResult = await response.json()
      setAnalysisPhase('Processing results') // Update phase

      // Separate handling for blocking issues vs warnings
      if (analysis.needsBetterImage) {
        // This is a blocking issue - requires user action
        setResult(analysis) // Still set result to display the feedback
        setErrorMessage(null) // Clear generic error message
      } else if (analysis.imageQualityIssue && analysis.imageQualityFeedback) {
        // This is a non-blocking warning - show results but also the warning
        setResult(analysis)
        setImageQualityWarning(analysis.imageQualityFeedback)
        setErrorMessage(null) // Clear generic error message
      } else {
        // Success case - no major quality issues
        setResult(analysis)
        setErrorMessage(null)
        setImageQualityWarning(null)
      }

    } catch (error: any) {
      console.error("Analysis error:", error)
      // Use the error message from the API if available, otherwise a generic one
      const message = error?.message || "An unexpected error occurred. Please try again."
      setErrorMessage(message)
      setResult(null)
      setImageQualityWarning(null)
    } finally {
      setIsLoading(false)
      setAnalysisPhase(null) // Clear phase on completion or error
    }
  }

  // Function to initiate analysis (used by button)
  const analyzeImage = (imageFile: File) => {
    setFile(imageFile);
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // Automatically submit after setting the file and preview
        formRef.current?.requestSubmit(); 
    };
    reader.readAsDataURL(imageFile);
  };

  // --- Image Upscaling Function ---
  const upscaleImage = (imageFile: File): Promise<File | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.warn("Canvas context not available for upscaling.");
            resolve(null); // Indicate failure
            return;
          }

          // Simple 2x upscale example
          const targetWidth = img.width * 2;
          const targetHeight = img.height * 2;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Disable image smoothing for potentially sharper results on pixelated images
          ctx.imageSmoothingEnabled = false;

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert canvas back to File
          canvas.toBlob((blob) => {
            if (blob) {
              const upscaledFile = new File([blob], `upscaled_${imageFile.name}`, {
                type: imageFile.type, // Keep original type
                lastModified: Date.now(),
              });
              // Optional: Check if upscaled size is reasonable (e.g., not excessively large)
              if (upscaledFile.size > 5 * 1024 * 1024) { // Limit upscaled size too
                 console.warn("Upscaled image exceeds size limit, using original.");
                 resolve(null);
              } else {
                 resolve(upscaledFile);
              }
            } else {
              console.warn("Canvas toBlob failed during upscaling.");
              resolve(null);
            }
          }, imageFile.type); // Use original image type
        };
        img.onerror = () => {
           console.warn("Failed to load image for upscaling.");
           resolve(null);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        console.warn("Failed to read file for upscaling.");
        resolve(null);
      };
      reader.readAsDataURL(imageFile);
    });
  };

  // --- Reset Function ---
  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setIsLoading(false)
    setResult(null)
    setErrorMessage(null)
    setImageQualityWarning(null)
    setShowCamera(false)
    stopCamera() // Ensure camera stops if it was open
    setAnalysisPhase(null)
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
  }

  // --- Drag and Drop Handlers ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const dt = e.dataTransfer
    const droppedFile = dt.files?.[0]

    if (!droppedFile) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(droppedFile.type)) {
      setErrorMessage("Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.")
      return
    }

    setFile(droppedFile)
    setResult(null)
    setErrorMessage(null)
    setImageQualityWarning(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(droppedFile)
  }

  const startCamera = async () => {
    try {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      videoRef.current.srcObject = stream
      setShowCamera(true)
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access your camera",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (!videoRef.current?.srcObject) return

    const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
    tracks.forEach((track) => track.stop())
    videoRef.current.srcObject = null
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const capturedFile = new File([blob], `meter-${Date.now()}.jpg`, {
          type: "image/jpeg",
        })

        setFile(capturedFile)
        setPreviewUrl(canvas.toDataURL("image/jpeg"))
        stopCamera()
        setResult(null)
        setErrorMessage(null)
        setImageQualityWarning(null)
      },
      "image/jpeg",
      0.9
    )
  }

  const getCertaintyColor = (certainty: number) => {
    if (certainty >= 90) return "text-green-600"
    if (certainty >= 75) return "text-blue-600"
    if (certainty >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getCertaintyBg = (certainty: number) => {
    if (certainty >= 90) return "bg-green-500"
    if (certainty >= 75) return "bg-blue-500"
    if (certainty >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  const getCertaintyLabel = (certainty: number) => {
    if (certainty >= 90) return "High Certainty"
    if (certainty >= 75) return "Moderate Certainty"
    if (certainty >= 60) return "Low Certainty"
    return "Very Uncertain"
  }
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isCameraActive = showCamera && hasCamera;
  
  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-4 animate-in fade-in duration-300">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Analysis Failed</p>
              <p className="text-sm mt-1">{errorMessage}</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="mt-3 bg-white text-red-700 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Quality Warning */}
      {imageQualityWarning && !result && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 mb-4 animate-in fade-in duration-300">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Better Image Needed</p>
              <p className="text-sm mt-1">{imageQualityWarning}</p>
              <div className="flex gap-2 mt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Upload New Photo
                </Button>
                {hasCamera && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleReset();
                      setShowCamera(true);
                    }}
                    className="bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Take New Photo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className={`flex flex-col ${result ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div 
          className={`
            border-2 border-dashed rounded-xl p-4 transition-all duration-200 ease-in-out
            ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}
            ${showCamera || previewUrl ? 'bg-black border-gray-800' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center min-h-[300px] relative">
            {/* Camera View */}
            {showCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    size="sm"
                    className="rounded-full h-12 w-12 p-0 bg-white hover:bg-gray-100"
                  >
                    <Camera className="h-6 w-6 text-blue-600" />
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={stopCamera}
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-gray-800/70 hover:bg-gray-700/70"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
            
            {/* Image Preview */}
            {previewUrl && !showCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <img
                  src={previewUrl}
                  alt="Meter preview"
                  className="max-h-full max-w-full object-contain"
                />
                <Button
                  type="button"
                  onClick={handleReset}
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-gray-800/70 hover:bg-gray-700/70"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
            
            {/* Upload UI */}
            {!showCamera && !previewUrl && (
              <div className="space-y-4 text-center">
                <div className="bg-blue-100 rounded-full p-3 mx-auto">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Upload Meter Photo</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Take a clear photo of your electricity meter
                  </p>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    onClick={triggerFileInput} 
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                  
                  {hasCamera && (
                    <Button 
                      type="button" 
                      onClick={() => setShowCamera(true)} 
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Use Camera
                    </Button>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Drag & drop also supported
                  </p>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg z-10">
                <div className="mb-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <p className="text-white font-medium mb-1">{analysisPhase || "Analyzing..."}</p>
                {/* Optional Progress Bar - could be tied to a more granular progress state if available */}
                {/* <Progress value={33} className="w-full max-w-xs mt-2" /> */}
              </div>
            )}
          </div>
        </div>
        
        {/* Submit button - only show if image is selected */}
        {previewUrl && !showCamera && !isLoading && (
          <Button 
            type="submit" 
            className="mt-4 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            disabled={isLoading || !file}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Meter
          </Button>
        )}
      </form>

      {/* Camera button for mobile */}
      {!previewUrl && !showCamera && hasCamera && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={startCamera}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="h-4 w-4" />
            <span>Take Photo</span>
          </Button>
        </div>
      )}
      
      {/* Better Image Needed Warning (high priority) */}
      {imageQualityWarning && !result && (
        <BetterImageNeeded 
          message={imageQualityWarning}
          onReset={handleReset}
          hasCamera={hasCamera}
          onStartCamera={startCamera}
        />
      )}

      {/* Minor Image Quality Warning (lower priority, only shown with results) */}
      {imageQualityWarning && result && result.result !== "RTS meter" && (
        <Card className="mt-4 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-amber-800">Image Quality Issue</h3>
                <p className="text-sm text-amber-700">{imageQualityWarning}</p>
                <div className="flex space-x-3 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => {
                      if (hasCamera) {
                        handleReset();
                        startCamera();
                      } else {
                        handleReset();
                      }
                    }}
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Take New Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Try Another Image
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-8 space-y-6"
        >
          {result.result === "RTS meter" ? (
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <CardTitle className="text-red-800">RTS Meter Detected</CardTitle>
                  </div>
                  {result.certainty !== undefined && result.certainty > 0 && (
                    <Badge variant="outline" className="ml-2 bg-red-100 border-red-200 text-red-800">
                      {result.certainty}% Certainty
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-red-700 font-medium">
                    You need to contact your utility supplier immediately about your RTS meter.
                  </p>
                  
                  <div className="p-4 bg-red-100 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Why this is important:</h4>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>RTS meters are being phased out across the UK and will soon stop working</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Your utility supplier needs to replace it with a smart meter</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>You risk losing access to cheaper off-peak electricity rates</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>The meter may stop receiving the radio signal that switches between rates</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Phone className="h-4 w-4 mr-2" /> 
                      Call Your Utility Supplier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <CardTitle className="text-blue-800">Not an RTS Meter</CardTitle>
                  </div>
                  
                  {result.certainty !== undefined && result.certainty > 0 && (
                    <Badge variant="default" className="ml-2">
                      {result.certainty}% {result.certainty > 90 ? "Confident" : "Certainty"}
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>Analysis complete</span>
                  {result.wasImageUpscaled && (
                    <Badge variant="outline" className="text-xs ml-2 bg-blue-50 border-blue-200 text-blue-700">
                      Enhanced Image
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-gray-700">{result.explanation || "No RTS meter was identified in the image."}</p>
                  </div>
                  
                  {/* Certainty Meter */}
                  {result.certainty !== undefined && (
                    <div className="pt-2 border-t border-blue-100 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Confidence Score:</span>
                        <span className={`font-medium ${getCertaintyColor(result.certainty)}`}>{result.certainty}%</span>
                      </div>
                      <div className="mt-1.5 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                          style={{ width: `${result.certainty}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Technical Details Accordion */}
                  {result.reasoning && (
                    <Accordion type="single" collapsible className="border rounded-lg">
                      <AccordionItem value="reasoning" className="border-b-0">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-blue-50/50">
                          <span className="text-sm font-medium text-blue-700">View Analysis Details</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-3 text-sm bg-gray-50">
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {result.reasoning}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  {/* Any additional info */}
                  {result.additionalInfo && (
                    <div className="border rounded-lg p-4 bg-blue-50/30">
                      <h4 className="text-sm font-medium text-blue-700 mb-1">Additional Information</h4>
                      <p className="text-sm text-gray-700">{result.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
      
      {/* App Version */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>CheckYourMeter v3.0.0 • Identify RTS meters quickly and easily</p>
      </div>
    </div>
  )
}
