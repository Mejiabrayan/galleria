import { v2 as cloudinary } from 'cloudinary';
import MediaGallery from '@/components/MediaGallery';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function Home() {

  const results = await cloudinary.api.resources();
  console.log('results', results)

  return (
    <div className='h-full mt-6'>
      <MediaGallery
        resources={[
          {
            id: 'my-image',
          },
        ]}
      />
    </div>
  );
}
