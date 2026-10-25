/**
 * Mengubah nama file gambar (mis. 'qris.png') menjadi URL lengkap
 * ke folder public/images/. Pakai BASE_URL supaya tetap jalan di
 * Vercel, GitHub Pages (subfolder), maupun custom domain.
 */
export function imageUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}images/${fileName}`
}
