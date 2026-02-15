import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMenu, FiX } from 'react-icons/fi'
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
import { contactApi } from '../../api/contactApi'
import type { Faq } from '../../types/contact'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

interface FaqFormState {
  id?: string
  question: string
  answer: string
}

const emptyForm: FaqFormState = {
  question: '',
  answer: '',
}

function SortableFaqItem({
  faq,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  faq: Faq
  onEdit: (faq: Faq) => void
  onDelete: (faq: Faq) => void
  onToggleActive: (faq: Faq) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: faq.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-text-light hover:text-text-medium mt-0.5"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-dark line-clamp-2">{faq.question}</p>
          <p className="text-xs text-text-light mt-1 line-clamp-2">{faq.answer}</p>
        </div>

        <button
          onClick={() => onToggleActive(faq)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
            faq.isActive ? 'bg-brand-green' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              faq.isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <button
          onClick={() => onEdit(faq)}
          className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg shrink-0"
          title="Editar"
        >
          <FiEdit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(faq)}
          className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
          title="Excluir"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<FaqFormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchFaqs = async () => {
    try {
      const res = await contactApi.listAllFaqs()
      setFaqs(res.data)
    } catch {
      toast.error('Erro ao carregar FAQs.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = faqs.findIndex((f) => f.id === active.id)
    const newIndex = faqs.findIndex((f) => f.id === over.id)

    const reordered = [...faqs]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setFaqs(reordered)

    try {
      await contactApi.reorderFaqs(reordered.map((f) => f.id))
      toast.success('Ordem atualizada.')
    } catch {
      toast.error('Erro ao reordenar.')
      fetchFaqs()
    }
  }

  const handleToggleActive = async (faq: Faq) => {
    try {
      await contactApi.updateFaq(faq.id, { isActive: !faq.isActive })
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isActive: !f.isActive } : f))
      )
      toast.success(faq.isActive ? 'FAQ desativada.' : 'FAQ ativada.')
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  const openCreateModal = () => {
    setFormData(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (faq: Faq) => {
    setFormData({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Pergunta e resposta são obrigatórias.')
      return
    }

    setIsSaving(true)
    try {
      if (formData.id) {
        await contactApi.updateFaq(formData.id, {
          question: formData.question,
          answer: formData.answer,
        })
        toast.success('FAQ atualizada.')
      } else {
        await contactApi.createFaq({
          question: formData.question,
          answer: formData.answer,
        })
        toast.success('FAQ criada.')
      }

      setModalOpen(false)
      fetchFaqs()
    } catch {
      toast.error('Erro ao salvar FAQ.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await contactApi.deleteFaq(deleteTarget.id)
      toast.success('FAQ excluída.')
      setDeleteTarget(null)
      fetchFaqs()
    } catch {
      toast.error('Erro ao excluir FAQ.')
    } finally {
      setIsDeleting(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Perguntas Frequentes</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-text-light">Nenhuma FAQ cadastrada.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={faqs.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <SortableFaqItem
                  key={faq.id}
                  faq={faq}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Preview section */}
      {faqs.filter((f) => f.isActive).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Preview</h2>
          <div className="space-y-3 max-w-2xl">
            {faqs
              .filter((f) => f.isActive)
              .map((faq) => (
                <details
                  key={faq.id}
                  className="border border-gray-200 rounded-lg group"
                >
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-text-dark hover:bg-gray-50 rounded-lg list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-text-light group-open:rotate-180 transition-transform">
                      &#9662;
                    </span>
                  </summary>
                  <div className="px-4 pb-3 text-sm text-text-medium">{faq.answer}</div>
                </details>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {formData.id ? 'Editar FAQ' : 'Nova FAQ'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Pergunta</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData((f) => ({ ...f, question: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Digite a pergunta..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Resposta</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData((f) => ({ ...f, answer: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Digite a resposta..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {formData.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir FAQ"
        message={`Tem certeza que deseja excluir esta FAQ?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
