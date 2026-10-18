import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../features/auth/useAuth'
import { Button } from '../components/ui/Button'
import loginBackground from '../assets/login-bg-full.jpg'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginPage() {
  const { signIn, configError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      toast.success('Welcome back')
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page relative min-h-screen overflow-hidden">
      <img
        src={loginBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-slate-950/25 to-slate-950/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-end px-4 py-8 sm:px-8 lg:px-16">
        <div className="hidden max-w-lg text-white lg:mr-auto lg:block lg:pr-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-xl font-extrabold shadow-lift">
            Q
          </div>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight xl:text-5xl">
            Quotation Management System
          </h1>
          <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-slate-200">
            Create, calculate, and manage professional software quotations in one calm workspace.
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-lift backdrop-blur-md sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-base font-extrabold text-white">
              Q
            </div>
            <div>
              <div className="text-lg font-extrabold text-ink">QMS</div>
              <p className="text-xs font-medium text-muted">Quotation Management</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold tracking-wide text-brand-700">Welcome back</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Sign in</h2>
            <p className="mt-2 text-sm font-medium text-muted">Use your workspace email and password.</p>
          </div>

          {configError ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {configError}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="flex flex-col gap-1.5 text-sm" htmlFor="email">
              <span className="font-medium text-slate-700">Email</span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`h-11 rounded-xl border bg-white px-3.5 text-ink shadow-soft transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
                  errors.email ? 'border-danger' : 'border-border hover:border-slate-300'
                }`}
                {...register('email')}
              />
              {errors.email ? (
                <span className="text-xs font-medium text-danger">{errors.email.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm" htmlFor="password">
              <span className="font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-ink shadow-soft transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
                    errors.password ? 'border-danger' : 'border-border hover:border-slate-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <span className="text-xs font-medium text-danger">{errors.password.message}</span>
              ) : null}
            </label>

            <Button type="submit" className="mt-2 w-full" disabled={submitting || Boolean(configError)}>
              {submitting ? 'Signing in…' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
