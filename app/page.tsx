import Image from 'next/image'
import MeterUploadForm from '@/components/meter-upload-form'
import { Toaster } from '@/components/ui/toaster'
import { Sparkles, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import ErrorBoundary from '@/components/error-boundary'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <div className="w-full py-6 bg-blue-600 mb-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center">
          <Zap className="h-7 w-7 text-white mr-3" />
          <h1 className="text-2xl font-bold text-white">Check Your Meter</h1>
        </div>
      </div>
      
      <div className="w-full max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-900 mb-3">
            Is your meter being phased out?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Take a photo of your electricity meter to check if it's an RTS meter that needs replacement
          </p>
          
          <div className="inline-flex items-center bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm text-blue-700">
            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
            Enhanced with AI vision technology
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-5 flex flex-col items-center text-center">
              <div className="bg-red-100 rounded-full p-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Why It Matters</h3>
              <p className="text-sm text-gray-600">RTS meters are being phased out and will stop working soon</p>
            </div>
            
            <div className="p-5 flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Instant Results</h3>
              <p className="text-sm text-gray-600">Get immediate analysis with clear instructions if action is needed</p>
            </div>
            
            <div className="p-5 flex flex-col items-center text-center">
              <div className="bg-amber-100 rounded-full p-3 mb-3">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Smart Enhancement</h3>
              <p className="text-sm text-gray-600">Image quality automatically improved for better analysis</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-tr from-blue-50 to-white rounded-xl shadow-lg border border-blue-100 p-6 mb-12">
          <ErrorBoundary>
            <MeterUploadForm />
          </ErrorBoundary>
        </div>
      </div>
      
      <footer className="w-full py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Check Your Meter • Helping UK households identify RTS meters
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This tool uses AI to analyze meter images but is not a substitute for professional advice
          </p>
        </div>
      </footer>
      
      <Toaster />
    </main>
  )
}
