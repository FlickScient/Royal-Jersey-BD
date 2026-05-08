import { useAdminGetMe, getAdminGetMeQueryKey } from "@workspace/api-client-react";

export function useAdminMe() {
  const { data: adminMe, isLoading, error } = useAdminGetMe({
    query: {
      queryKey: getAdminGetMeQueryKey(),
      retry: false,
    }
  });

  return {
    isAdmin: adminMe?.isAdmin ?? false,
    isLoading,
    error,
  };
}
