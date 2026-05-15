'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { adminLogin } from '@/app/admin-login/action'
import Image from 'next/image'

type AdminLoginFormProps = {
  from: string
  error?: string
  lockoutMinutes: number
}

type FormErrors = {
  email?: string
  password?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d1b2a] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(13,27,42,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#13273f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b2a] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          Signing In...
        </>
      ) : (
        'Sign In'
      )}
    </button>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A3.25 3.25 0 0 0 13.42 13.42" />
      <path d="M9.9 5.36A10.9 10.9 0 0 1 12 5.25C18 5.25 21.75 12 21.75 12a19.66 19.66 0 0 1-3.15 4.16" />
      <path d="M6.54 6.54C3.84 8.78 2.25 12 2.25 12S6 18.75 12 18.75a10.96 10.96 0 0 0 3.16-.46" />
    </svg>
  )
}

export function AdminLoginForm({ from, error, lockoutMinutes }: AdminLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [passwordValue, setPasswordValue] = useState('')
  const [emailValue, setEmailValue] = useState('')

  const serverError = useMemo(() => {
    if (error === 'locked') {
      return `Too many failed attempts. Access locked for ${lockoutMinutes} minutes.`
    }

    if (error === 'unauthorized') {
      return 'Your account does not have admin access.'
    }

    if (error === 'invalid' || error === '1') {
      return 'Incorrect email or password. Please try again.'
    }

    return ''
  }, [error, lockoutMinutes])

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!emailValue.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!passwordValue.trim()) {
      nextErrors.password = 'Password is required.'
    } else if (passwordValue.trim().length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!validate()) {
      event.preventDefault()
    }
  }

  const hasEmailError = Boolean(formErrors.email)
  const hasPasswordError = Boolean(formErrors.password)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f0e8] text-[#0d1b2a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,27,42,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(138,155,176,0.2),transparent_30%),linear-gradient(135deg,#f8f4ec_0%,#f5f0e8_45%,#efe7da_100%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(13,27,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(13,27,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[440px] animate-[fade-in_0.5s_ease-out] rounded-[28px] border border-[#ede6d8] bg-white/92 p-6 shadow-[0_24px_80px_rgba(13,27,42,0.12)] backdrop-blur-sm sm:p-8 md:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex-shrink-0">
              <Image
                src="/images/logo/logo.svg"
                alt="LK Document Services"
                width={103}
                height={66}
                className="w-[103px] h-[66px]"
                priority
              />
            </div>
            <h1 className="text-[1.55rem] font-semibold tracking-[-0.03em] sm:text-[1.7rem]">
              LK Document Services
            </h1>
            <p className="mt-2 text-sm text-[#728095] sm:text-[0.95rem]">
              Admin Dashboard — Secure Sign In
            </p>
          </div>

          <div
            className="mb-6 rounded-2xl border border-[#ebdfcf] bg-[#faf7f1] px-4 py-3 text-sm text-[#6f2d2d] shadow-[0_10px_20px_rgba(13,27,42,0.04)]"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fde8e6] text-[#922b21]">
                !
              </div>
              <p>{serverError || 'Sign in with your admin credentials to continue.'}</p>
            </div>
          </div>

          <form action={adminLogin} onSubmit={handleSubmit} noValidate className="space-y-5">
            <input type="hidden" name="from" value={from} />

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#0d1b2a]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                inputMode="email"
                value={emailValue}
                onChange={(event) => {
                  setEmailValue(event.target.value)
                  if (hasEmailError) {
                    setFormErrors((current) => ({ ...current, email: undefined }))
                  }
                }}
                aria-invalid={hasEmailError}
                aria-describedby={hasEmailError ? 'email-error' : 'email-hint'}
                placeholder="info@lkdoc.com"
                className={`h-12 w-full rounded-2xl border bg-[#fcfbf7] px-4 text-[15px] text-[#0d1b2a] shadow-sm transition duration-200 placeholder:text-[#9aa6b4] focus:border-[#0d1b2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1b2a]/10 ${hasEmailError ? 'border-[#c74949] ring-1 ring-[#c74949]/20' : 'border-[#e6dccb]'}`}
              />
              <p id="email-hint" className="text-xs text-[#8a9bb0]">
                Use your admin email address.
              </p>
              {hasEmailError ? (
                <p id="email-error" className="text-xs font-medium text-[#b23b3b]">
                  {formErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0d1b2a]">
                Password
              </label>
              <div className={`flex h-12 items-center rounded-2xl border bg-[#fcfbf7] shadow-sm transition duration-200 focus-within:border-[#0d1b2a] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0d1b2a]/10 ${hasPasswordError ? 'border-[#c74949] ring-1 ring-[#c74949]/20' : 'border-[#e6dccb]'}`}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={passwordValue}
                  onChange={(event) => {
                    setPasswordValue(event.target.value)
                    if (hasPasswordError) {
                      setFormErrors((current) => ({ ...current, password: undefined }))
                    }
                  }}
                  aria-invalid={hasPasswordError}
                  aria-describedby={hasPasswordError ? 'password-error' : 'password-hint'}
                  placeholder="Enter your password"
                  className="h-full flex-1 bg-transparent px-4 text-[15px] text-[#0d1b2a] outline-none placeholder:text-[#9aa6b4]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#728095] transition hover:bg-[#ede6d8] hover:text-[#0d1b2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b2a]/20"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <p id="password-hint" className="text-xs text-[#8a9bb0]">
                Minimum 8 characters.
              </p>
              {hasPasswordError ? (
                <p id="password-error" className="text-xs font-medium text-[#b23b3b]">
                  {formErrors.password}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-[#516173]">
                <input
                  type="checkbox"
                  name="remember_me"
                  className="h-4 w-4 rounded border-[#d2c7b5] text-[#0d1b2a] focus:ring-[#0d1b2a]"
                />
                Remember me
              </label>

              <a
                href="mailto:info@lkdoc.com?subject=Admin%20password%20reset"
                className="text-xs font-medium text-[#0d1b2a] transition hover:text-[#17304a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b2a]/20"
              >
                Forgot Password?
              </a>
            </div>

            <div className="pt-1">
              <SubmitButton />
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#8a9bb0]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#e6dccb] bg-[#fbf8f2] text-[10px] font-semibold text-[#0d1b2a]">
              ✓
            </span>
            <span>Protected by Supabase Auth · LK Document Services</span>
          </div>
        </div>
      </section>
    </main>
  )
}
