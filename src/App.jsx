import { Toaster } from 'sonner'
import { AuthProvider } from './features/auth/AuthProvider'
import { AppRouter } from './app/router'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster richColors position="top-right" closeButton />
    </AuthProvider>
  )
}
