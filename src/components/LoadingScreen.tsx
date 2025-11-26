import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-700 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  )
}
