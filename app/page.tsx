import Image from 'next/image'
import SelfieUploadForm from '@/components/selfie-upload-form'
import { Toaster } from '@/components/ui/toaster'
import { Sparkles, Camera, Share2, CheckCircle, TrendingUp } from 'lucide-react'
import ErrorBoundary from '@/components/error-boundary'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#15162c] to-[#1e1b4b] text-white">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#FF7CFD] blur-[120px]"></div>
          <div className="absolute top-[40%] right-[5%] w-72 h-72 rounded-full bg-[#76F4D1] blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[35%] w-80 h-80 rounded-full bg-[#FF7CFD] blur-[150px]"></div>
        </div>
      </div>
      
      {/* Navbar */}
      <nav className="backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] rounded-lg">
              <Image 
                src="/glow-up-logo.svg" 
                alt="Glow-Up Logo" 
                width={28} 
                height={28}
                className="transform -rotate-3"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">Glow</span>
              <span className="text-white">-Up</span>
            </h1>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1.5 text-xs rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse flex items-center">
              <Sparkles className="h-3 w-3 mr-1.5 text-[#76F4D1]" />
              <span>Powered by AI</span>
            </span>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-20">
        {/* Hero section */}
        <div className="text-center mb-12 mt-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">
              Reinvent Your Style
            </span>
            <br />
            <span className="text-white">Using AI Magic</span>
          </h2>
          <p className="text-lg text-white/70 mb-6 max-w-2xl mx-auto">
            Upload a selfie and get TikTok-ready transformations with personalized style recommendations
          </p>
          
          <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-full px-4 py-2 text-sm border border-white/10">
            <Sparkles className="h-4 w-4 mr-2 text-[#76F4D1]" />
            Powered by the latest AI vision technology
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7CFD]/10 group">
            <div className="bg-gradient-to-r from-[#FF7CFD] to-[#FF7CFD]/70 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2 text-white group-hover:text-[#FF7CFD] transition-colors">Take a Selfie</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors">Upload a clear front-facing photo or use your camera</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#76F4D1]/10 group">
            <div className="bg-gradient-to-r from-[#76F4D1] to-[#76F4D1]/70 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2 text-white group-hover:text-[#76F4D1] transition-colors">AI Transforms You</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors">Get three AI-generated style transformations in seconds</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7CFD]/10 group">
            <div className="bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-xl mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1] transition-colors">Share & Shop</h3>
            <p className="text-white/70 group-hover:text-white/90 transition-colors">Get style tips and product recommendations</p>
          </div>
        </div>
        
        {/* Selfie upload section */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-[#FF7CFD]/5">
          <div className="p-1 bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]"></div>
          <div className="p-6">
            <ErrorBoundary>
              <SelfieUploadForm />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      
      <footer className="border-t border-white/10 py-8 backdrop-blur-md mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-white/50 text-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <Image 
              src="/glow-up-logo.svg" 
              alt="Glow-Up Logo" 
              width={20} 
              height={20} 
              className="mr-2"
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7CFD] to-[#76F4D1]">
              Glow-Up
            </span>
          </div>
          <p>Transform your look with AI-powered style recommendations</p>
          <p className="mt-2 md:mt-0 text-xs"> {new Date().getFullYear()} Glow-Up</p>
        </div>
      </footer>
      
      <Toaster />
    </main>
  )
}
