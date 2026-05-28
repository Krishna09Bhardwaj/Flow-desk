import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLogin } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { mutate, isPending } = useLogin()

  const submit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold text-foreground">FlowDesk</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your workspace</p>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          No account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
