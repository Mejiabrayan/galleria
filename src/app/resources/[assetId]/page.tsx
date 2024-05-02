import MediaViewer from '@/components/MediaViewer';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function Resource({
  params,
}: {
  params: {
    assetId: string;
  };
}) {
  const result = await cloudinary.api.resources_by_asset_ids(params.assetId);
  console.log('results', result);
  return (
    <MediaViewer
      resource={result.resources[0]}
    />
  );
}

export default Resource;
