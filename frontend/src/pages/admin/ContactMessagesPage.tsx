import { useState, useEffect, useCallback } from 'react'
import { FiMail, FiCheckCircle, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { contactApi } from '../../api/contactApi'
import type { ContactMessage } from '../../types/contact'
import type { PaginatedResult } from '../../types/product'
import { formatDateTime } from '../../utils/formatDate'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<PaginatedResult<ContactMessage> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const pageSize = 15

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await contactApi.list({ page, pageSize })
      setMessages(res.data)
    } catch {
      toast.error('Erro ao carregar mensagens.')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      try {
        await contactApi.markAsRead(message.id)
        setMessages((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((m) =>
                  m.id === message.id ? { ...m, isRead: true } : m
                ),
              }
            : null
        )
      } catch {
        // Silently fail marking as read
      }
    }
  }

  const handleMarkAsRead = async (message: ContactMessage) => {
    try {
      await contactApi.markAsRead(message.id)
      setMessages((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((m) =>
                m.id === message.id ? { ...m, isRead: true } : m
              ),
            }
          : null
      )
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, isRead: true })
      }
      toast.success('Mensagem marcada como lida.')
    } catch {
      toast.error('Erro ao marcar como lida.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await contactApi.delete(deleteTarget.id)
      toast.success('Mensagem excluída.')
      setDeleteTarget(null)
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null)
      }
      fetchMessages()
    } catch {
      toast.error('Erro ao excluir mensagem.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">Mensagens de Contato</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Messages table */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
            </div>
          ) : !messages || messages.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-light">Nenhuma mensagem encontrada.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Assunto</th>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Data</th>
                      <th className="text-center py-3 px-4 font-medium text-text-light">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-text-light">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.items.map((message, idx) => (
                      <tr
                        key={message.id}
                        onClick={() => handleViewMessage(message)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id
                            ? 'bg-brand-blue/5'
                            : idx % 2 === 1
                            ? 'bg-gray-50/50 hover:bg-gray-50'
                            : 'hover:bg-gray-50'
                        } ${!message.isRead ? 'font-medium' : ''}`}
                      >
                        <td className="py-3 px-4 text-text-dark">{message.name}</td>
                        <td className="py-3 px-4 text-text-medium truncate max-w-48">
                          {message.subject || 'Sem assunto'}
                        </td>
                        <td className="py-3 px-4 text-text-light whitespace-nowrap">
                          {formatDateTime(message.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {message.isRead ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-light">
                              Lida
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-brand-blue/10 text-brand-blue font-medium">
                              Nova
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {!message.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(message)}
                                className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                                title="Marcar como lida"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {message.phone && (
                              <a
                                href={buildWhatsAppUrl(
                                  message.phone,
                                  `Olá ${message.name}, recebemos sua mensagem e gostaríamos de responder.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-text-light hover:text-brand-green hover:bg-brand-green/5 rounded-lg"
                                title="Responder via WhatsApp"
                              >
                                <FaWhatsapp className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => setDeleteTarget(message)}
                              className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Excluir"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {messages.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <p className="text-sm text-text-light">
                    Página {messages.page} de {messages.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(messages.totalPages, p + 1))}
                      disabled={page >= messages.totalPages}
                      className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message detail panel */}
        {selectedMessage && (
          <div className="lg:w-96 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">Detalhes</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 text-text-light hover:text-text-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">Nome</dt>
                <dd className="text-sm text-text-dark mt-0.5">{selectedMessage.name}</dd>
              </div>
              {selectedMessage.email && (
                <div>
                  <dt className="text-xs font-medium text-text-light uppercase">E-mail</dt>
                  <dd className="text-sm text-text-dark mt-0.5">{selectedMessage.email}</dd>
                </div>
              )}
              {selectedMessage.phone && (
                <div>
                  <dt className="text-xs font-medium text-text-light uppercase">Telefone</dt>
                  <dd className="text-sm text-text-dark mt-0.5 flex items-center gap-2">
                    {selectedMessage.phone}
                    <a
                      href={buildWhatsAppUrl(
                        selectedMessage.phone,
                        `Olá ${selectedMessage.name}, recebemos sua mensagem e gostaríamos de responder.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </dd>
                </div>
              )}
              {selectedMessage.subject && (
                <div>
                  <dt className="text-xs font-medium text-text-light uppercase">Assunto</dt>
                  <dd className="text-sm text-text-dark mt-0.5">{selectedMessage.subject}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">Data</dt>
                <dd className="text-sm text-text-dark mt-0.5">
                  {formatDateTime(selectedMessage.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">Mensagem</dt>
                <dd className="text-sm text-text-dark mt-0.5 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                  {selectedMessage.message}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-2">
              {!selectedMessage.isRead && (
                <button
                  onClick={() => handleMarkAsRead(selectedMessage)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 rounded-lg"
                >
                  <FiMail className="w-4 h-4" />
                  Marcar como lida
                </button>
              )}
              <button
                onClick={() => setDeleteTarget(selectedMessage)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Mensagem"
        message="Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
