import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data)
      toast.success('Login realizado com sucesso!')
      navigate('/admin')
    } catch {
      toast.error('E-mail ou senha incorretos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-4xl">🌸</span>
          <h1 className="text-2xl font-bold text-text-dark mt-2">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-text-medium">
            Floricultura Embeleze
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="w-5 h-5 text-text-light" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="admin@embeleze.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="w-5 h-5 text-text-light" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Sua senha"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <FiLogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
