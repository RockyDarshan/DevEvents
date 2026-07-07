'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import posthog from 'posthog-js'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

  try {
  posthog.capture('login_attempted', { email: formData.email })

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Login failed.')
  }

  // Store real JWT instead of mock object
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  setSuccess('Login successful! Redirecting...')
  posthog.capture('login_successful', { email: formData.email })

  setTimeout(() => {
    window.location.href = '/'
  }, 1500)
} catch (err) {
  setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
  posthog.capture('login_failed', { error: err })
} finally {
  setLoading(false)
}
  }

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-20">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-green-500">{success}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-white/50" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/50" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-white/70">
              Don &apos t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </p>
            <Link href="#" className="block text-sm text-white/50 hover:text-white/70">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
