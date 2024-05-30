import QueryProviders from '@/components/QueryProvider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  creator: 'Brayan Mejia Cuenca',
  title: {
    default: 'Galleria | Cloudinary Photos',
    template: '%s | Galleria',
  },
  description:
    '"Galleria is a photo library & editor with Next.js & Cloudinary',
  keywords: 'cloudinary, image, video, library, Next.js, React, Tailwind CSS',
  authors: [
    {
      name: 'Brayan Mejia Cuenca',
      url: 'https://www.linkedin.com/in/brayan-mejia/',
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'en-US',
    url: 'https://galleria.vercel.app',
    title: 'Galleria | Cloudinary Photos',
    images: [
      {
        url: '/galleria.png',
        width: 1200,
        height: 630,
        alt: 'Galleria | Cloudinary Photos',
      },
    ],
    description:
      '"Galleria is a photo library & editor with Next.js & Cloudinary',
    siteName: 'Galleria',
    countryName: 'United States',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <QueryProviders>{children}</QueryProviders>
      </body>
    </html>
  );
}
