import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FiSave, FiUser, FiLock } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/authApi'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.email('E-mail inválido'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual deve ter ao menos 6 caracteres'),
  newPassword: z.string().min(6, 'Nova senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação deve ter ao menos 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSavingProfile(true)
    try {
      await authApi.updateProfile(data)
      toast.success('Perfil atualizado com sucesso!')
    } catch {
      toast.error('Erro ao atualizar perfil.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSavingPassword(true)
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Senha alterada com sucesso!')
      resetPassword()
    } catch {
      toast.error('Erro ao alterar senha. Verifique a senha atual.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-dark">Meu Perfil</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
            <FiUser className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 className="text-lg font-semibold text-text-dark">Dados do Perfil</h2>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Nome Completo</label>
            <input
              {...registerProfile('fullName')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                profileErrors.fullName ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {profileErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">{profileErrors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">E-mail</label>
            <input
              type="email"
              {...registerProfile('email')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                profileErrors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {profileErrors.email && (
              <p className="mt-1 text-xs text-red-500">{profileErrors.email.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {isSavingProfile ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-pink/10 flex items-center justify-center">
            <FiLock className="w-5 h-5 text-brand-pink" />
          </div>
          <h2 className="text-lg font-semibold text-text-dark">Alterar Senha</h2>
        </div>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Senha Atual</label>
            <input
              type="password"
              {...registerPassword('currentPassword')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Nova Senha</label>
            <input
              type="password"
              {...registerPassword('newPassword')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              {...registerPassword('confirmPassword')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {isSavingPassword ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FiLock className="w-4 h-4" />
              )}
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
