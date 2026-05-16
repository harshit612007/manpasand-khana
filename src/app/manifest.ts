import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Manpasand Khana',
    short_name: 'Manpasand',
    description: 'Delicious home-cooked tiffins delivered to your doorstep.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff8f5',
    theme_color: '#9d4300',
    icons: [
      {
        src: '/icon.png', // We'll assume this exists or use a default one
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
