import { put, del } from '@vercel/blob'
import { validateStorageUsage } from '../middleware/usage'
import { updateStorageUsage } from './usage'

// Interface for uploaded file metadata
interface FileMetadata {
  userId: string
  filename: string
  size: number
  contentType: string
  uploadedAt: string
}

// Track user's storage usage in memory for demo purposes
// In production, this would be stored in a database
const userStorage: Record<
  string,
  {
    totalBytes: number
    files: Record<string, FileMetadata>
  }
> = {}

// Initialize or get a user's storage tracking
const getUserStorage = (userId: string) => {
  if (!userStorage[userId]) {
    userStorage[userId] = {
      totalBytes: 0,
      files: {},
    }
  }
  return userStorage[userId]
}

// Upload a file to Vercel Blob storage
export async function uploadFile(
  userId: string,
  file: File
): Promise<{ url: string; success: boolean; message?: string }> {
  try {
    // Check if the user has enough storage quota
    const validation = await validateStorageUsage(userId, file.size)

    if (!validation.allowed) {
      return {
        url: '',
        success: false,
        message: validation.message,
      }
    }

    // Upload the file to Vercel Blob
    const { url } = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Track the file in user's storage
    const storage = getUserStorage(userId)

    const metadata: FileMetadata = {
      userId,
      filename: file.name,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
    }

    storage.files[url] = metadata
    storage.totalBytes += file.size

    // Update user's storage usage metrics
    await updateStorageUsage(userId, storage.totalBytes)

    return {
      url,
      success: true,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      url: '',
      success: false,
      message: 'Failed to upload file. Please try again.',
    }
  }
}

// Delete a file from Vercel Blob storage
export async function deleteFile(
  userId: string,
  url: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if the file belongs to the user
    const storage = getUserStorage(userId)
    const fileMetadata = storage.files[url]

    if (!fileMetadata) {
      return {
        success: false,
        message: 'File not found or you do not have permission to delete it.',
      }
    }

    // Delete the file from Vercel Blob
    await del(url)

    // Update user's storage tracking
    storage.totalBytes -= fileMetadata.size
    delete storage.files[url]

    // Update user's storage usage metrics
    await updateStorageUsage(userId, storage.totalBytes)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      message: 'Failed to delete file. Please try again.',
    }
  }
}

// List all files for a user
export async function listUserFiles(
  userId: string
): Promise<{ files: FileMetadata[]; totalSize: number }> {
  try {
    // In a real implementation, this would query the database
    // For now, we'll return from our in-memory tracking
    const storage = getUserStorage(userId)

    return {
      files: Object.values(storage.files),
      totalSize: storage.totalBytes,
    }
  } catch (error) {
    console.error('Error listing files:', error)
    return {
      files: [],
      totalSize: 0,
    }
  }
}
