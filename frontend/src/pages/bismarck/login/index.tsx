import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { pb } from '@/lib/pocketbase'
import { useAdminLogin } from './hooks/useAdminLogin'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  identity: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useAdminLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (pb.authStore.isValid) navigate('/bismarck/dashboard', { replace: true })
  }, [navigate])

  function onSubmit(values: FormValues) {
    login(values, {
      onSuccess: () => navigate('/bismarck/dashboard', { replace: true }),
    })
  }

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Bismarck</h1>
        <p className="text-stone-500 text-sm mb-6">Admin Login</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email or Username</label>
            <input
              {...register('identity')}
              type="text"
              autoComplete="username"
              placeholder="you@example.com or your_username"
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                errors.identity ? 'border-red-400' : 'border-stone-300',
              )}
            />
            {errors.identity && <p className="text-red-500 text-xs mt-1">{errors.identity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className={cn(
                'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400',
                errors.password ? 'border-red-400' : 'border-stone-300',
              )}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">Invalid credentials.</p>}
          <button
            type="submit"
            disabled={isPending}
            aria-label={isPending ? 'Loading…' : undefined}
            className="cursor-pointer w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            {isPending ? <LoadingSpinner size="sm" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
