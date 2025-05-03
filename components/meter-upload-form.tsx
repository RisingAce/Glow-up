"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
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

const BetterImageNeeded = ({ message, onReset }: { 
  message: string; 
  onReset: () => void;
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
  const [imageQualityWarning, setImageQualityWarning] = useState<string | null>(null)
  
  const [dragActive, setDragActive] = useState(false)
  const [analysisPhase, setAnalysisPhase] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const isMobile = useMobile()
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      
      // Check file size and type
      if (droppedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB. Please upload a smaller image.",
          variant: "destructive",
        })
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, WEBP, or GIF image.",
          variant: "destructive",
        })
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
  }

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
    e.preventDefault();
    if (!file || isLoading) return;

    // Reset all state before starting
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setImageQualityWarning(null);
    setAnalysisPhase('Preparing analysis');

    try {
      // --- STEP 1: Initial attempt with original image ---
      let originalAnalysis = null;
      let enhancedAnalysis = null;
      let finalAnalysis = null;
      let wasEnhanced = false;

      // Try original image first
      setAnalysisPhase('Analyzing original image');
      try {
        originalAnalysis = await performApiAnalysis(file, false);
        console.log("Original analysis:", originalAnalysis);
      } catch (err) {
        console.error("Error during original image analysis:", err);
      }

      // --- STEP 2: Try with enhancement if original has issues or low confidence ---
      const needsEnhancement = !originalAnalysis || 
                              (originalAnalysis.confidence_score ?? 0) < 0.89;
      
      if (needsEnhancement) {
        setAnalysisPhase('Enhancing image quality');
        const enhancedFile = await upscaleImage(file);
        
        if (enhancedFile) {
          setAnalysisPhase('Analyzing enhanced image');
          try {
            enhancedAnalysis = await performApiAnalysis(enhancedFile, true);
            wasEnhanced = true;
            console.log("Enhanced analysis:", enhancedAnalysis);
          } catch (err) {
            console.error("Error during enhanced image analysis:", err);
          }
        }
      }

      // --- STEP 3: Choose the best result ---
      // We'll preserve BOTH confidence scores instead of just picking the higher one
      let originalConfidence = originalAnalysis ? (originalAnalysis.confidence_score ?? 0) : 0;
      let enhancedConfidence = enhancedAnalysis ? (enhancedAnalysis.confidence_score ?? 0) : 0;
      
      // Default certainty displayed will be the higher of the two (or just the one we have)
      const displayCertainty = Math.max(
        enhancedConfidence ? Math.round(enhancedConfidence * 100) : 0,
        originalConfidence ? Math.round(originalConfidence * 100) : 0
      );
      
      // Log for debugging
      console.log("Original confidence:", originalConfidence, 
                 "Enhanced confidence:", enhancedConfidence,
                 "Display certainty:", displayCertainty);
      
      // Always use the highest confidence result for the analysis details
      if (enhancedAnalysis && originalAnalysis) {
        if (enhancedConfidence >= originalConfidence) {
          finalAnalysis = {
            ...enhancedAnalysis,
            wasImageUpscaled: true,
            // Critical: Force the certainty value to match our calculation
            certainty: displayCertainty,
            // Store both confidence scores for reference
            confidence_score: enhancedConfidence,
            original_confidence_score: originalConfidence
          };
        } else {
          finalAnalysis = {
            ...originalAnalysis,
            wasImageUpscaled: false,
            certainty: displayCertainty,
            confidence_score: originalConfidence,
            enhanced_confidence_score: enhancedConfidence
          };
        }
      } else if (enhancedAnalysis) {
        finalAnalysis = {
          ...enhancedAnalysis,
          wasImageUpscaled: true,
          certainty: displayCertainty,
          confidence_score: enhancedConfidence
        };
      } else if (originalAnalysis) {
        finalAnalysis = {
          ...originalAnalysis,
          wasImageUpscaled: false,
          certainty: displayCertainty,
          confidence_score: originalConfidence
        };
      } else {
        throw new Error("Analysis failed. Please try again with a clearer image.");
      }

      // --- STEP 4: Display results with appropriate warnings ---
      setAnalysisPhase('Processing results');
      
      // Always show the result we got
      setResult(finalAnalysis);
      
      // Set appropriate warning based on confidence
      if (displayCertainty < 70) {
        if (wasEnhanced) {
          setImageQualityWarning(`Very low confidence (${displayCertainty}% after enhancement). Results are likely unreliable. Consider uploading a clearer image for better analysis.`);
        } else {
          setImageQualityWarning(`Very low confidence (${displayCertainty}%). Results are likely unreliable. Consider uploading a clearer image for better analysis.`);
        }
      } else if (displayCertainty < 89) {
        if (wasEnhanced) {
          const improvementText = originalConfidence > 0 
            ? ` (improved from ${Math.round(originalConfidence * 100)}%)`
            : '';
          setImageQualityWarning(`Low confidence (${displayCertainty}%${improvementText}). Results may be less reliable with this image quality.`);
        } else {
          setImageQualityWarning(`Low confidence (${displayCertainty}%). Results may be less reliable. Consider using a clearer image.`);
        }
      } else if (displayCertainty < 95) {
        if (wasEnhanced && originalConfidence > 0) {
          setImageQualityWarning(`Moderate confidence (${displayCertainty}%, improved from ${Math.round(originalConfidence * 100)}%). Results should be reasonably accurate.`);
        } else {
          setImageQualityWarning(`Moderate confidence (${displayCertainty}%). Results should be reasonably accurate.`);
        }
      } else {
        setImageQualityWarning(null);
      }
      
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setErrorMessage(error?.message || "Analysis failed. Please try again.");
      setResult(null);
    } finally {
      setIsLoading(false);
      setAnalysisPhase(null);
    }
  };

  // Helper function to analyze an image with error handling
  const performApiAnalysis = async (imageFile: File, wasUpscaled: boolean): Promise<MeterAnalysisResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('wasImageUpscaled', String(wasUpscaled));

    const response = await fetch('/api/checkMeter', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    if (!result) {
      throw new Error("Failed to parse analysis result");
    }

    return result;
  };

  // Function to initiate analysis (used by button)
  const initiateImageAnalysis = (imageFile: File) => {
    setFile(imageFile);
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // Automatically submit after setting the file and preview
        formRef.current?.requestSubmit(); 
    };
    reader.readAsDataURL(imageFile);
  };

  // --- Enhanced Image Upscaling Function ---
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

          // More sophisticated upscaling with sharpening
          // Use 2.5x for low-resolution images, 1.5x for larger ones
          const scaleFactor = img.width < 800 ? 2.5 : 1.5;
          const targetWidth = Math.round(img.width * scaleFactor);
          const targetHeight = Math.round(img.height * scaleFactor);
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // First pass: bilinear scaling with smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Optional: Apply contrast enhancement
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const enhancedData = enhanceContrast(imageData, 1.2); // 1.2 = moderate enhancement
          ctx.putImageData(enhancedData, 0, 0);

          // Convert canvas back to File with improved quality
          canvas.toBlob((blob) => {
            if (blob) {
              const upscaledFile = new File([blob], `upscaled_${imageFile.name}`, {
                type: 'image/jpeg', // Use JPEG for better quality control
                lastModified: Date.now(),
              });
              
              // Check if upscaled size is reasonable
              if (upscaledFile.size > 5 * 1024 * 1024) { // 5MB limit
                 console.warn("Upscaled image exceeds size limit, using compressed version.");
                 
                 // Try again with compression
                 canvas.toBlob((compressedBlob) => {
                   if (compressedBlob) {
                     const compressedFile = new File([compressedBlob], `upscaled_${imageFile.name}`, {
                       type: 'image/jpeg',
                       lastModified: Date.now(),
                     });
                     resolve(compressedFile);
                   } else {
                     resolve(null);
                   }
                 }, 'image/jpeg', 0.7); // 70% quality
              } else {
                 resolve(upscaledFile);
              }
            } else {
              console.warn("Canvas toBlob failed during upscaling.");
              resolve(null);
            }
          }, 'image/jpeg', 0.9); // 90% quality
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

  // Helper function for contrast enhancement
  const enhanceContrast = (imageData: ImageData, factor: number): ImageData => {
    const data = imageData.data;
    const len = data.length;
    
    // Calculate average luminance (approximate)
    let totalLuminance = 0;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Weighted luminance formula (perceived brightness)
      totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
    }
    const avgLuminance = totalLuminance / (len / 4);
    
    // Apply contrast enhancement
    for (let i = 0; i < len; i += 4) {
      // For each RGB channel
      for (let j = 0; j < 3; j++) {
        const value = data[i + j];
        // Apply contrast relative to average luminance
        data[i + j] = Math.min(255, Math.max(0, 
          avgLuminance + factor * (value - avgLuminance)
        ));
      }
      // Alpha channel unchanged
    }
    
    return imageData;
  };

  // --- Reset Function ---
  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setErrorMessage(null)
    setImageQualityWarning(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
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
            ${previewUrl ? 'bg-black border-gray-800' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center min-h-[300px] relative">
            {/* Image Preview */}
            {previewUrl && (
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
            {!previewUrl && (
              <div className="space-y-4 text-center">
                <div className="bg-blue-100 rounded-full p-3 mx-auto">
                  <Upload className="h-6 w-6 text-blue-600" />
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
              </div>
            )}
          </div>
        </div>
        
        {/* Submit button - only show if image is selected */}
        {previewUrl && !isLoading && (
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

      {/* Better Image Needed Warning (high priority) */}
      {imageQualityWarning && !result && (
        <BetterImageNeeded 
          message={imageQualityWarning}
          onReset={handleReset}
        />
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
                      {result.original_confidence_score !== undefined && (
                        <span className="text-xs ml-1">(improved from {Math.round(result.original_confidence_score * 100)}%)</span>
                      )}
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
                      {result.original_confidence_score !== undefined && (
                        <span className="text-xs ml-1">(from {Math.round(result.original_confidence_score * 100)}%)</span>
                      )}
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
