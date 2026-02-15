import { useState, useEffect } from 'react'
import {
  FiEye,
  FiEyeOff,
  FiMenu,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiHome,
  FiStar,
  FiShoppingBag,
  FiTag,
  FiInstagram,
  FiPhone,
  FiZap,
  FiImage,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { homePageApi } from '../../api/homePageApi'
import type { HomePageSection, Banner } from '../../types/homePage'
import { HomePageSectionType } from '../../types/homePage'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

const sectionTypeLabels: Record<HomePageSectionType, string> = {
  [HomePageSectionType.Hero]: 'Hero / Banner Principal',
  [HomePageSectionType.Diferenciais]: 'Diferenciais',
  [HomePageSectionType.FeaturedProducts]: 'Produtos em Destaque',
  [HomePageSectionType.Promotions]: 'Promoções',
  [HomePageSectionType.Instagram]: 'Instagram',
  [HomePageSectionType.ContactInfo]: 'Informações de Contato',
  [HomePageSectionType.CTA]: 'Call to Action',
  [HomePageSectionType.Banners]: 'Banners',
}

const sectionTypeIcons: Record<HomePageSectionType, React.ComponentType<{ className?: string }>> = {
  [HomePageSectionType.Hero]: FiHome,
  [HomePageSectionType.Diferenciais]: FiStar,
  [HomePageSectionType.FeaturedProducts]: FiShoppingBag,
  [HomePageSectionType.Promotions]: FiTag,
  [HomePageSectionType.Instagram]: FiInstagram,
  [HomePageSectionType.ContactInfo]: FiPhone,
  [HomePageSectionType.CTA]: FiZap,
  [HomePageSectionType.Banners]: FiImage,
}

function SortableSectionItem({
  section,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onUpdateSection,
}: {
  section: HomePageSection
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onToggleVisibility: (section: HomePageSection) => void
  onUpdateSection: (id: string, data: Partial<HomePageSection>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const Icon = sectionTypeIcons[section.sectionType] ?? FiHome
  const [localTitle, setLocalTitle] = useState(section.title ?? '')
  const [localSubtitle, setLocalSubtitle] = useState(section.subtitle ?? '')

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="cursor-grab text-text-light hover:text-text-medium">
          <FiMenu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-blue" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-dark">
            {sectionTypeLabels[section.sectionType]}
          </p>
          {section.title && (
            <p className="text-xs text-text-light truncate">{section.title}</p>
          )}
        </div>

        <button
          onClick={() => onToggleVisibility(section)}
          className={`p-2 rounded-lg transition-colors ${
            section.isVisible
              ? 'text-brand-green hover:bg-brand-green/5'
              : 'text-text-light hover:bg-gray-100'
          }`}
          title={section.isVisible ? 'Visível' : 'Oculta'}
        >
          {section.isVisible ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onToggleExpand(section.id)}
          className="p-2 text-text-light hover:bg-gray-100 rounded-lg"
        >
          {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Título</label>
            <input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              placeholder="Título da seção"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Subtítulo</label>
            <input
              value={localSubtitle}
              onChange={(e) => setLocalSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              placeholder="Subtítulo da seção"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() =>
                onUpdateSection(section.id, {
                  title: localTitle || null,
                  subtitle: localSubtitle || null,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90"
            >
              <FiSave className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface BannerFormState {
  id?: string
  imageUrl: string
  linkUrl: string
  title: string
  description: string
}

const emptyBannerForm: BannerFormState = {
  imageUrl: '',
  linkUrl: '',
  title: '',
  description: '',
}

export default function HomePageCustomizationPage() {
  const [sections, setSections] = useState<HomePageSection[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [bannerModal, setBannerModal] = useState(false)
  const [bannerForm, setBannerForm] = useState<BannerFormState>(emptyBannerForm)
  const [isSavingBanner, setIsSavingBanner] = useState(false)
  const [deleteBannerTarget, setDeleteBannerTarget] = useState<Banner | null>(null)
  const [isDeletingBanner, setIsDeletingBanner] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, bannersRes] = await Promise.all([
          homePageApi.getAllSections(),
          homePageApi.getBanners(),
        ])
        setSections(sectionsRes.data)
        setBanners(bannersRes.data)
      } catch {
        toast.error('Erro ao carregar dados da home page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    const reordered = [...sections]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setSections(reordered)

    try {
      await homePageApi.reorderSections(reordered.map((s) => s.id))
      toast.success('Ordem das seções atualizada.')
    } catch {
      toast.error('Erro ao reordenar seções.')
    }
  }

  const handleToggleVisibility = async (section: HomePageSection) => {
    try {
      await homePageApi.updateSection(section.id, { isVisible: !section.isVisible })
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s))
      )
      toast.success(section.isVisible ? 'Seção ocultada.' : 'Seção visível.')
    } catch {
      toast.error('Erro ao alterar visibilidade.')
    }
  }

  const handleUpdateSection = async (id: string, data: Partial<HomePageSection>) => {
    try {
      await homePageApi.updateSection(id, data)
      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
      toast.success('Seção atualizada.')
    } catch {
      toast.error('Erro ao atualizar seção.')
    }
  }

  const handleToggleExpand = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id))
  }

  const openCreateBannerModal = () => {
    setBannerForm(emptyBannerForm)
    setBannerModal(true)
  }

  const openEditBannerModal = (banner: Banner) => {
    setBannerForm({
      id: banner.id,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      title: banner.title ?? '',
      description: banner.description ?? '',
    })
    setBannerModal(true)
  }

  const handleSaveBanner = async () => {
    if (!bannerForm.imageUrl.trim()) {
      toast.error('URL da imagem é obrigatória.')
      return
    }

    setIsSavingBanner(true)
    try {
      if (bannerForm.id) {
        const updated = await homePageApi.updateBanner(bannerForm.id, {
          imageUrl: bannerForm.imageUrl,
          linkUrl: bannerForm.linkUrl || null,
          title: bannerForm.title || null,
          description: bannerForm.description || null,
        })
        setBanners((prev) => prev.map((b) => (b.id === bannerForm.id ? updated.data : b)))
        toast.success('Banner atualizado.')
      } else {
        const formData = new FormData()
        formData.append('imageUrl', bannerForm.imageUrl)
        if (bannerForm.linkUrl) formData.append('linkUrl', bannerForm.linkUrl)
        if (bannerForm.title) formData.append('title', bannerForm.title)
        if (bannerForm.description) formData.append('description', bannerForm.description)
        const created = await homePageApi.createBanner(formData)
        setBanners((prev) => [...prev, created.data])
        toast.success('Banner criado.')
      }
      setBannerModal(false)
    } catch {
      toast.error('Erro ao salvar banner.')
    } finally {
      setIsSavingBanner(false)
    }
  }

  const handleDeleteBanner = async () => {
    if (!deleteBannerTarget) return
    setIsDeletingBanner(true)
    try {
      await homePageApi.deleteBanner(deleteBannerTarget.id)
      setBanners((prev) => prev.filter((b) => b.id !== deleteBannerTarget.id))
      setDeleteBannerTarget(null)
      toast.success('Banner excluído.')
    } catch {
      toast.error('Erro ao excluir banner.')
    } finally {
      setIsDeletingBanner(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-dark">Personalização da Home Page</h1>

      {/* Sections */}
      <div>
        <h2 className="text-lg font-semibold text-text-dark mb-4">Seções</h2>
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-text-light">Nenhuma seção encontrada.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isExpanded={expandedSection === section.id}
                    onToggleExpand={handleToggleExpand}
                    onToggleVisibility={handleToggleVisibility}
                    onUpdateSection={handleUpdateSection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Banners */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-dark">Banners</h2>
          <button
            onClick={openCreateBannerModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Novo Banner
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-text-light">Nenhum banner cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title ?? 'Banner'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-text-dark truncate">
                    {banner.title || 'Sem título'}
                  </p>
                  {banner.description && (
                    <p className="text-xs text-text-light truncate mt-0.5">{banner.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => openEditBannerModal(banner)}
                      className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                      title="Editar"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteBannerTarget(banner)}
                      className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Excluir"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner modal */}
      {bannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setBannerModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {bannerForm.id ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <button onClick={() => setBannerModal(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">URL da Imagem</label>
                <input
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">URL do Link</label>
                <input
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="https://... (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Título</label>
                <input
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Título do banner (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Descrição</label>
                <textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descrição do banner (opcional)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setBannerModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBanner}
                disabled={isSavingBanner}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingBanner && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {bannerForm.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete banner confirm */}
      <ConfirmDialog
        isOpen={!!deleteBannerTarget}
        title="Excluir Banner"
        message="Tem certeza que deseja excluir este banner?"
        confirmLabel="Excluir"
        onConfirm={handleDeleteBanner}
        onCancel={() => setDeleteBannerTarget(null)}
        isLoading={isDeletingBanner}
      />
    </div>
  )
}
