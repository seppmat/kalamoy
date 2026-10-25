import { useEffect, useState, type ReactNode } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  /** Ditampilkan jika file gambar belum ada / gagal dimuat. */
  fallback: ReactNode
  /** Dipanggil saat status gambar diketahui (true = berhasil dimuat). */
  onStatusChange?: (ok: boolean) => void
}

/**
 * <img> yang tidak menampilkan ikon rusak: kalau file belum diletakkan di
 * public/images/, tampil placeholder berlabel jelas.
 */
export default function SafeImage({ src, alt, className, fallback, onStatusChange }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed) return <>{fallback}</>

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding="async"
      onLoad={() => onStatusChange?.(true)}
      onError={() => {
        setFailed(true)
        onStatusChange?.(false)
      }}
    />
  )
}
