import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { storeSettingsApi } from '../../api/storeSettingsApi'
import type { StoreSettings, BusinessHours } from '../../types/storeSettings'

const settingsSchema = z.object({
  businessName: z.string().min(1, 'Nome é obrigatório'),
  whatsAppNumber: z.string().min(10, 'Número do WhatsApp é obrigatório'),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  googleMapsEmbedUrl: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const tabs = [
  { id: 'business', label: 'Negócio' },
  { id: 'address', label: 'Endereço' },
  { id: 'social', label: 'Redes Sociais' },
  { id: 'hours', label: 'Horários' },
  { id: 'about', label: 'Sobre' },
  { id: 'map', label: 'Mapa' },
] as const

type TabId = typeof tabs[number]['id']

export default function StoreSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('business')
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [aboutContent, setAboutContent] = useState('')
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await storeSettingsApi.get()
        const data = res.data
        setSettings(data)
        reset({
          businessName: data.businessName,
          whatsAppNumber: data.whatsAppNumber,
          phoneNumber: data.phoneNumber ?? '',
          email: data.email ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          zipCode: data.zipCode ?? '',
          instagramUrl: data.instagramUrl ?? '',
          facebookUrl: data.facebookUrl ?? '',
          googleMapsEmbedUrl: data.googleMapsEmbedUrl ?? '',
        })
        setBusinessHours(data.businessHours ?? [])
        setAboutContent(data.aboutContent ?? '')
      } catch {
        toast.error('Erro ao carregar configurações.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [reset])

  const onSubmit = async (formData: SettingsFormData) => {
    setIsSaving(true)
    try {
      await storeSettingsApi.update({
        ...settings,
        businessName: formData.businessName,
        whatsAppNumber: formData.whatsAppNumber,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        instagramUrl: formData.instagramUrl || null,
        facebookUrl: formData.facebookUrl || null,
        googleMapsEmbedUrl: formData.googleMapsEmbedUrl || null,
        aboutContent: aboutContent || null,
        businessHours,
      })
      toast.success('Configurações salvas com sucesso!')
    } catch {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setIsSaving(false)
    }
  }

  const addBusinessHour = () => {
    setBusinessHours((prev) => [...prev, { day: '', hours: '' }])
  }

  const updateBusinessHour = (index: number, field: keyof BusinessHours, value: string) => {
    setBusinessHours((prev) =>
      prev.map((bh, i) => (i === index ? { ...bh, [field]: value } : bh))
    )
  }

  const removeBusinessHour = (index: number) => {
    setBusinessHours((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-text-dark">Configurações da Loja</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-blue text-white'
                : 'text-text-medium hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Business tab */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">Informações do Negócio</h2>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Nome do Negócio</label>
              <input
                {...register('businessName')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                  errors.businessName ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.businessName && (
                <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">WhatsApp</label>
                <input
                  {...register('whatsAppNumber')}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                    errors.whatsAppNumber ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="5511999999999"
                />
                {errors.whatsAppNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.whatsAppNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Telefone</label>
                <input
                  {...register('phoneNumber')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">E-mail</label>
              <input
                {...register('email')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>
          </div>
        )}

        {/* Address tab */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">Endereço</h2>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Endereço</label>
              <input
                {...register('address')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Cidade</label>
                <input
                  {...register('city')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Estado</label>
                <input
                  {...register('state')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">CEP</label>
                <input
                  {...register('zipCode')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">Redes Sociais</h2>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Instagram URL</label>
              <input
                {...register('instagramUrl')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Facebook URL</label>
              <input
                {...register('facebookUrl')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        )}

        {/* Hours tab */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-dark">Horários de Funcionamento</h2>
              <button
                type="button"
                onClick={addBusinessHour}
                className="inline-flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue/80"
              >
                <FiPlus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {businessHours.length === 0 ? (
              <p className="text-sm text-text-light">Nenhum horário cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {businessHours.map((bh, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      value={bh.day}
                      onChange={(e) => updateBusinessHour(index, 'day', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="Ex: Segunda a Sexta"
                    />
                    <input
                      value={bh.hours}
                      onChange={(e) => updateBusinessHour(index, 'hours', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="Ex: 08:00 - 18:00"
                    />
                    <button
                      type="button"
                      onClick={() => removeBusinessHour(index)}
                      className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">Sobre a Loja</h2>
            <div className="[&_.ql-container]:min-h-50 [&_.ql-editor]:min-h-50">
              <ReactQuill
                theme="snow"
                value={aboutContent}
                onChange={setAboutContent}
                placeholder="Conte a história da sua floricultura..."
              />
            </div>
          </div>
        )}

        {/* Map tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">Google Maps</h2>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                URL de Incorporação do Google Maps
              </label>
              <input
                {...register('googleMapsEmbedUrl')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="mt-1 text-xs text-text-light">
                Cole a URL de incorporação do Google Maps para exibir o mapa na página de contato.
              </p>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  )
}
