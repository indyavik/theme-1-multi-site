/**
 * EDITABLE IMAGE - In-Place Image Upload & Management Component
 * 
 * Provides click-to-upload functionality for images in preview mode.
 * Handles multi-site image resolution with fallback logic.
 * 
 * Features:
 * - Click to upload in preview mode, static display in public mode
 * - Multi-site image paths: /sites/{siteSlug}/image.png with fallback to /image.png
 * - Image upload with drag & drop support
 * - Automatic fallback when site-specific images don't exist
 * - Preview before publishing changes
 * - File validation (type, size limits)
 * 
 * Image Resolution Logic:
 * 1. If src starts with http(s):// → use as-is (external URLs)
 * 2. If src starts with / → try /sites/{siteSlug}{src} first
 * 3. If site-specific fails → fallback to original src (shared public assets)
 * 
 * Usage: Replace any <img> with <EditableImage>
 * 
 * Example:
 * <EditableImage 
 *   path="sections.hero.heroImage" 
 *   src="/placeholder.jpg" 
 *   alt="Hero image" 
 *   width={800} 
 *   height={400} 
 * />
 */

"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { usePreviewContext } from "./preview-context"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApiUrl } from "@/theme/lib/theme-config"

interface EditableImageProps {
  path: string
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function EditableImage({ 
  path, 
  src, 
  alt, 
  width = 500, 
  height = 500, 
  className = "",
  priority = false 
}: EditableImageProps) {
  const { isPreviewMode, updateField, getValue } = usePreviewContext()
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [showSmallToolbar, setShowSmallToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState<{ top: number; right: number } | null>(null)
  
  // Resolve image path with per-site override then shared fallback
  // Rules:
  // - If value starts with http(s):// -> use as-is
  // - If value starts with / -> first try /sites/<siteSlug>/<value.slice(1)>; if it 404s, fallback to /<value.slice(1)> (shared public)
  const storedPath = (getValue(path) as string) || src
  const siteSlug: string | undefined = (getValue('site.slug') as string) || undefined
  const preferred = useMemo(() => {
    if (!storedPath) return src
    if (/^https?:\/\//i.test(storedPath)) return storedPath
    if (storedPath.startsWith('/') && siteSlug) {
      return `/sites/${siteSlug}${storedPath}`
    }
    return storedPath
  }, [storedPath, siteSlug, src])

  const [finalSrc, setFinalSrc] = useState<string | null>(null)

  useEffect(() => {
    if (pendingDataUrl) {
      setFinalSrc(pendingDataUrl)
      return
    }
    setFinalSrc(preferred)
  }, [pendingDataUrl, preferred])

  const isSmall = width <= 96 || height <= 96

  const updateToolbarRect = () => {
    if (!imgRef.current || typeof window === 'undefined') return
    const r = imgRef.current.getBoundingClientRect()
    setToolbarPos({ top: Math.max(4, r.top - 8), right: Math.max(4, window.innerWidth - r.right) })
  }

  useEffect(() => {
    if (!isSmall) return
    if (showSmallToolbar) {
      updateToolbarRect()
      const onScroll = () => updateToolbarRect()
      const onResize = () => updateToolbarRect()
      window.addEventListener('scroll', onScroll, true)
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('scroll', onScroll, true)
        window.removeEventListener('resize', onResize)
      }
    }
  }, [showSmallToolbar, isSmall])

  useEffect(() => {
    if (isSmall && pendingDataUrl) {
      setShowSmallToolbar(true)
      updateToolbarRect()
    }
  }, [pendingDataUrl, isSmall])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create a data URL for immediate preview (stage only)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPendingDataUrl(dataUrl)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
      setIsUploading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    if (pendingDataUrl) {
      setPendingDataUrl(null)
      setError(null)
      return
    }
    updateField(path, "")
  }

  function dataUrlToBlob(dataUrl: string): Blob {
    const [meta, base64] = dataUrl.split(',')
    const mimeMatch = meta.match(/data:(.*?);base64/)
    const contentType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: contentType })
  }

  const handlePublishImage = async () => {
    if (!pendingDataUrl) return
    setIsPublishing(true)
    setError(null)
    try {
      const blob = dataUrlToBlob(pendingDataUrl)
      const fileNameFromPath = storedPath?.split('/').pop() || 'image'
      const form = new FormData()
      form.append('path', storedPath)
      // Use site slug from site-data instead of environment variable
      const currentSiteSlug = getValue('site.slug') as string
      if (currentSiteSlug) form.append('siteSlug', currentSiteSlug)
      form.append('file', new File([blob], fileNameFromPath))

      const res = await fetch(getApiUrl('/api/sites/publish-image'), {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Upload failed: ${res.status}`)
      }

      // Clear staged image and leave stored path unchanged (backend overwrote file)
      setPendingDataUrl(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Upload failed')
      alert('Image publish failed. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Shared <img> props with per-site fallback logic in onError
  const imgProps = {
    alt,
    width,
    height,
    className,
    loading: priority ? "eager" : "lazy",
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget
      // If we tried site-specific path and it failed, fallback to shared public path
      if (siteSlug && storedPath?.startsWith('/') && el.src.includes(`/sites/${siteSlug}/`)) {
        el.src = storedPath
      }
    }
  }

  if (!isPreviewMode) {
    // Normal display mode - just show the image with fallback
    return (
      <img
        src={finalSrc || src}
        {...imgProps}
      />
    )
  }

  // Preview mode - show image with upload overlay
  return (
    <div className="relative group" onMouseEnter={() => isSmall && setShowSmallToolbar(true)} onMouseLeave={() => isSmall && !pendingDataUrl && setShowSmallToolbar(false)}>
      <img
        ref={imgRef}
        src={finalSrc || src}
        {...imgProps}
      />
      {
        // Large images: show centered overlay with clear buttons
        (width > 96 && height > 96) ? (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              {!pendingDataUrl && (
                <Button onClick={handleUploadClick} disabled={isUploading} size="sm" className="bg-white text-black hover:bg-gray-100">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
              )}
              {pendingDataUrl && (
                <>
                  <Button onClick={handlePublishImage} disabled={isPublishing} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isPublishing ? 'Publishing…' : 'Publish Image'}
                  </Button>
                  <Button onClick={handleRemoveImage} size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null
      }

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {error && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-red-400 bg-black/60 px-2 py-1 rounded">
          {error}
        </div>
      )}
      {/* Small image toolbar rendered via portal to avoid clipping */}
      {isSmall && showSmallToolbar && toolbarPos && typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: toolbarPos.top, right: toolbarPos.right, zIndex: 9999 }} className="flex items-center gap-1 bg-white/95 rounded shadow px-1 py-0.5">
          <Button onClick={handleUploadClick} disabled={isUploading} size="sm" className="h-7 w-7 p-0 rounded bg-white/0 hover:bg-gray-100" aria-label="Upload image" title="Upload image">
            <Upload className="h-3.5 w-3.5 text-gray-700" />
          </Button>
          {pendingDataUrl && (
            <>
              <Button onClick={handlePublishImage} disabled={isPublishing} size="sm" className="h-7 px-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">{isPublishing ? '…' : 'Publish'}</Button>
              <Button onClick={handleRemoveImage} size="sm" variant="destructive" className="h-7 px-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Cancel">
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>, document.body)
      }
    </div>
  )
}
