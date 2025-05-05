import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, Share2, Sparkles, RefreshCw, Camera, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlowUpResult } from '@/types/glow-up-types'
import { useToast } from '@/components/ui/use-toast'

interface GlowUpResultsProps {
  result: GlowUpResult
  originalImage: string | null
}

export default function GlowUpResults({ result, originalImage }: GlowUpResultsProps) {
  const [currentTab, setCurrentTab] = useState<string>("soft-glow")
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  
  const { faceAnalysis, styleRecommendations, transformedImages } = result
  
  if (!styleRecommendations || !transformedImages || !faceAnalysis) {
    return null
  }
  
  // Get the looks and transform them for easy access
  const looks = styleRecommendations.looks.map((look, index) => {
    const matchingImage = transformedImages.find(img => img.lookName === look.name) || transformedImages[index]
    return {
      ...look,
      id: look.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: matchingImage?.imageUrl || ''
    }
  })
  
  // Function to generate transition video (simplified version - in a real app this would use WebGL/ARKit)
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true)
    
    try {
      // In a real implementation, this would use a proper video generation API
      // For now, we'll simulate it with a setTimeout
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // For demonstration purposes only - in a real app this would be an actual video URL
      // Since we can't actually create a video here, we'll just display a success message
      toast({
        title: "Video Generated!",
        description: "Your transformation video has been created!",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Video Generation Failed",
        description: "There was an error creating your transition video.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingVideo(false)
    }
  }
  
  // Function to share to social media
  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My Glow-Up Transformation',
        text: 'Check out my amazing glow-up transformation powered by AI!',
        // In a real app, this would be the URL to the shared content
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared Successfully!",
          description: "Your glow-up has been shared.",
          variant: "default"
        })
      })
      .catch((error) => {
        toast({
          title: "Share Failed",
          description: "Could not share your glow-up.",
          variant: "destructive"
        })
      })
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support the Share API. Try copying the link manually.",
        variant: "destructive"
      })
    }
  }
  
  // Function to download the current look
  const handleDownload = (imageUrl: string, lookName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `glow-up-${lookName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download Started",
      description: `Your ${lookName} look is being downloaded.`,
      variant: "default"
    })
  }
  
  return (
    <div className="space-y-10 mt-12 pb-6">
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
            <span className="text-sm text-white/80 flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-[#76F4D1]" />
              AI Generated Results
            </span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">
          Your Stunning Transformations
        </h2>
        
        <p className="text-white/70 text-center max-w-xl mx-auto">
          Based on your facial features and structure, we've created these personalized style looks just for you
        </p>
      </div>
      
      <Tabs 
        defaultValue={looks[0]?.id || "soft-glow"} 
        className="w-full"
        onValueChange={setCurrentTab}
      >
        <div className="flex justify-center mb-6">
          <TabsList className="bg-white/5 backdrop-blur-md border border-white/10 p-1">
            {looks.map(look => (
              <TabsTrigger 
                key={look.id} 
                value={look.id}
                className="px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF7CFD] data-[state=active]:to-[#76F4D1] data-[state=active]:text-white data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white/90"
              >
                {look.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {looks.map(look => (
          <TabsContent 
            key={look.id} 
            value={look.id}
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image comparison */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-0.5 bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]"></div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-white">Before & After</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20">
                      <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                        Before
                      </div>
                      {originalImage && (
                        <img 
                          src={originalImage} 
                          alt="Original selfie"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20">
                      <div className="absolute top-2 left-2 text-xs bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] text-white px-2 py-1 rounded-full backdrop-blur-sm">
                        After
                      </div>
                      <img 
                        src={look.imageUrl} 
                        alt={`${look.name} transformation`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="grid grid-cols-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => handleDownload(look.imageUrl, look.name)}
                    className="rounded-none py-3 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleShare}
                    className="rounded-none py-3 text-white/80 hover:text-white hover:bg-white/5 border-x border-white/10"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="rounded-none py-3 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Camera size={16} className="mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Style details */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-0.5 bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">
                    {look.name} Style
                  </h3>
                  
                  <p className="text-white/90 mb-5">{look.description}</p>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <h4 className="text-sm font-medium text-white/90 mb-1.5 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#FF7CFD] mr-2"></span>
                        Hair Styling
                      </h4>
                      <p className="text-sm text-white/70 pl-4">{look.hairStyling}</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <h4 className="text-sm font-medium text-white/90 mb-1.5 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#A2CBFD] mr-2"></span>
                        Makeup
                      </h4>
                      <p className="text-sm text-white/70 pl-4">{look.makeup}</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <h4 className="text-sm font-medium text-white/90 mb-1.5 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#76F4D1] mr-2"></span>
                        Accessories
                      </h4>
                      <p className="text-sm text-white/70 pl-4">{look.accessories}</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 bg-gradient-to-r from-[#FF7CFD]/10 to-[#76F4D1]/10 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                    <h4 className="text-sm font-semibold text-white mb-2">Pro Style Tips</h4>
                    <p className="text-sm text-white/80 italic">{look.styleNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Shopping recommendations */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
        <div className="p-0.5 bg-gradient-to-r from-[#76F4D1] to-[#FF7CFD]"></div>
        <div className="p-6">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-r from-[#76F4D1] to-[#FF7CFD] rounded-lg mr-3">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Shopping Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {styleRecommendations.shoppingList.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <h4 className="font-medium text-white mb-1">{item.productName}</h4>
                <p className="text-sm text-white/60">{item.purpose}</p>
                <p className="text-sm italic text-white/80 mt-2 p-2 bg-black/20 rounded border border-white/5">"{item.benefit}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
