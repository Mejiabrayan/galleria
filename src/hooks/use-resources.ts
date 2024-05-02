import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudinaryResource } from '@/types/cloudinary';

interface UseResources {
  initialResources?: Array<CloudinaryResource>;
  disableFetch?: boolean;
  tag?: string;
}
export function useResources(options?: UseResources) {
  const queryClient = useQueryClient();
  const { disableFetch = false } = options || {};
  
  const { data: resources } = useQuery({
    queryKey: ['resources', options?.tag],
    queryFn: async () => {
      const { data } = await fetch('/api/resources').then((r) => r.json());
      return data;
    },
    initialData: options?.initialResources,
    enabled: !disableFetch, // we're only going to fetch the data if the disableFetch is false
  });
  // merges the old data with the new data and sets it in the query cache using the key ['resources']
  function addResources(results: Array<CloudinaryResource>) {
    queryClient.setQueryData(
      ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG)],
      (old: Array<CloudinaryResource>) => {
        return [...results, ...old];
      }
    );
    console.log('add resources', results);

    queryClient.invalidateQueries({
      queryKey: [
        'resources',
        String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG),
      ],
    });
    console.log('add resources', results);
  }
  return { resources, addResources };
}
