import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudinaryResource } from '@/types/cloudinary';

interface UseResources {
  initialResources?: Array<CloudinaryResource>;
}
export function useResources(options?: UseResources) {
  const queryClient = useQueryClient();

  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data } = await fetch('/api/resources').then((r) => r.json());
      return data;
    },
    initialData: options?.initialResources
  });
  // merges the old data with the new data and sets it in the query cache using the key ['resources']
  function addResources(results: Array<CloudinaryResource>) {
    queryClient.setQueryData(
      ['resources'],
      (old: Array<CloudinaryResource>) => {
        return [...results, ...old];
      }
    );
    console.log('add resources', results);

    queryClient.invalidateQueries({
      queryKey: ['resources'],
    });
    console.log('add resources', results);
  }
  return { resources, addResources };
}
