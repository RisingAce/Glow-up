"use client";

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { Sparkles, Upload, Camera, RefreshCw, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Progress } from '@/components/ui/progress'
import { GlowUpResult } from '@/types/glow-up-types'
import GlowUpResults from './glow-up-results'

export default function SelfieUploadForm() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [result, setResult] = useState<GlowUpResult | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const { toast } = useToast()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Validate file is an image
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        })
        return
      }
      
      setFileName(file.name)
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Reset results
      setResult(null)
    }
  }
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  // Trigger camera input
  const handleCameraClick = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraActive(true)
      
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        })
        .catch(err => {
          toast({
            title: "Camera Error",
            description: "Could not access your camera. Please check permissions.",
            variant: "destructive"
          })
          setCameraActive(false)
        })
    } else {
      toast({
        title: "Camera Not Supported",
        description: "Your browser doesn't support camera access.",
        variant: "destructive"
      })
    }
  }
  
  // Take a photo from the camera
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the video frame to the canvas
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to image
        const imgDataUrl = canvas.toDataURL('image/jpeg')
        setSelectedImage(imgDataUrl)
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
        
        // Turn off camera UI
        setCameraActive(false)
        
        // Reset results
        setResult(null)
        setFileName('camera_photo.jpg')
      }
    }
  }
  
  // Cancel camera mode
  const handleCancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
    setCameraActive(false)
  }
  
  // Clear the selected image
  const handleClearImage = () => {
    setSelectedImage(null)
    setFileName('')
    
    // Reset the file input 
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Reset results
    setResult(null)
  }
  
  // Process the image for glow-up
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload or take a photo first",
        variant: "destructive"
      })
      return
    }
    
    setIsProcessing(true)
    setProgress(10)
    
    try {
      // Prepare the image for upload
      const formData = new FormData()
      formData.append('image', selectedImage)
      
      // Upload to the API
      const response = await fetch('/api/glowUp', {
        method: 'POST',
        body: JSON.stringify({ image: selectedImage }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Update progress during the API call
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval)
            return prevProgress
          }
          return prevProgress + Math.random() * 10
        })
      }, 500)
      
      const data = await response.json()
      clearInterval(progressInterval)
      setProgress(100)
      
      if (response.ok) {
        setResult(data)
        toast({
          title: "Glow Up Complete!",
          description: "Your transformation is ready",
          variant: "default"
        })
      } else {
        throw new Error(data.message || 'An error occurred')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {cameraActive ? (
        <div className="relative bg-black/90 rounded-xl overflow-hidden">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            className="w-full h-[400px] object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleCancelCamera}
                className="bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              
              <Button
                onClick={handleTakePhoto}
                className="bg-[#76F4D1] text-black hover:bg-[#76F4D1]/80"
              >
                <Camera size={16} className="mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">
              Upload your selfie for a glow-up transformation
            </h3>
            <p className="text-white/70 text-lg">
              Our AI will analyze your features and create stunning new looks
            </p>
          </div>
          
          {/* Upload area */}
          {!selectedImage ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-5">
                <div className="p-3 bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] rounded-full shadow-lg shadow-[#FF7CFD]/20">
                  <Sparkles size={28} className="text-white" />
                </div>
                
                <h4 className="font-semibold text-xl text-white">Drag & drop your selfie here</h4>
                <p className="text-white/70 max-w-xs">
                  For best results, use a well-lit, front-facing photo with your face clearly visible
                </p>
                
                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={handleUploadClick}
                    className="bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] hover:opacity-90 text-white border-none px-5 py-6"
                  >
                    <Upload size={18} className="mr-2" />
                    Choose File
                  </Button>
                  
                  <Button 
                    onClick={handleCameraClick}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-5 py-6"
                  >
                    <Camera size={18} className="mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-lg">
                <img 
                  src={selectedImage} 
                  alt="Selected selfie" 
                  className="w-full h-[350px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div>
                    <span className="text-white text-sm font-medium bg-black/60 py-1.5 px-3 rounded-full flex items-center backdrop-blur-sm">
                      <ImageIcon size={12} className="mr-1.5" />
                      {fileName}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleClearImage}
                    className="bg-black/60 hover:bg-black/80 border-none text-white backdrop-blur-sm"
                  >
                    <X size={14} className="mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
              
              {isProcessing ? (
                <div className="mt-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Processing your glow-up...</span>
                    <span className="text-[#76F4D1] font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 bg-white/10"
                  />
                  <p className="text-xs text-white/60 mt-3 italic">
                    This may take a minute. Our AI is analyzing your features and creating personalized styles.
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="mt-5 w-full bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] hover:opacity-90 text-white py-6 text-lg shadow-lg shadow-[#FF7CFD]/10"
                  disabled={isProcessing}
                >
                  <Sparkles size={18} className="mr-2" />
                  Glow Me Up!
                </Button>
              )}
            </div>
          )}
          
          {/* Results area */}
          {result && result.success && (
            <GlowUpResults result={result} originalImage={selectedImage} />
          )}
        </div>
      )}
    </div>
  )
}
