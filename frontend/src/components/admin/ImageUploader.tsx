import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud, FiX, FiStar } from 'react-icons/fi'

interface ImageItem {
  id: string
  url: string
  isMain: boolean
}

interface ImageUploaderProps {
  images: ImageItem[]
  onUpload: (files: File[]) => void
  onRemove: (id: string) => void
  onSetMain: (id: string) => void
  isUploading?: boolean
}

export default function ImageUploader({
  images,
  onUpload,
  onRemove,
  onSetMain,
  isUploading = false,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles)
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand-blue bg-brand-blue/5'
            : 'border-gray-300 hover:border-brand-blue'
        }`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud className="w-10 h-10 mx-auto text-text-light mb-3" />
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-blue border-t-transparent" />
            <p className="text-sm text-text-medium">Enviando...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-brand-blue font-medium">Solte as imagens aqui...</p>
        ) : (
          <div>
            <p className="text-sm text-text-medium">
              Arraste imagens aqui ou{' '}
              <span className="text-brand-blue font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-text-light mt-1">PNG, JPG ou WEBP</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                image.isMain ? 'border-brand-blue' : 'border-gray-200'
              }`}
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-32 object-cover"
              />
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  Principal
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isMain && (
                  <button
                    type="button"
                    onClick={() => onSetMain(image.id)}
                    className="p-2 bg-white rounded-full text-brand-blue hover:bg-gray-100"
                    title="Definir como principal"
                  >
                    <FiStar className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(image.id)}
                  className="p-2 bg-white rounded-full text-red-500 hover:bg-gray-100"
                  title="Remover"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
