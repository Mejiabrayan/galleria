import '@/app/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources - Cloudinary Photos',
  description: 'Image and video library',
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="h-screen overflow-hidden">
      { children }
    </main>
  )
}