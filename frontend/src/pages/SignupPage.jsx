import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSignup } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const { mutate, isPending } = useSignup()

  const submit = (e) => { e.preventDefault(); mutate(form) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold text-foreground">FlowDesk</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-1">Join your team on FlowDesk</p>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input id="signup-name" name="name" autoComplete="name" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <Input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-role">Role</Label>
            <select id="signup-role" name="role" value={form.role} onChange={set('role')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
