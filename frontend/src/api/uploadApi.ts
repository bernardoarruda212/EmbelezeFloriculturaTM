import api from './axiosInstance'

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ imageUrl: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadImages: (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return api.post<{ imageUrls: string[] }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage: (imageUrl: string) =>
    api.delete('/upload/image', { data: { imageUrl } }),
}
