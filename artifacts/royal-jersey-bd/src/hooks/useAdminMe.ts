import { useAdminGetMe, getAdminGetMeQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";

export function useAdminMe() {
  const { user, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const { data: adminMe, isLoading: queryLoading } = useAdminGetMe({
    query: {
      queryKey: getAdminGetMeQueryKey(),
      retry: false,
      enabled: clerkLoaded && !!isSignedIn,
    }
  });

  const isLoading = !clerkLoaded || (!!isSignedIn && queryLoading);

  return {
    isAdmin: adminMe?.isAdmin ?? false,
    isSignedIn: !!isSignedIn,
    userId: adminMe?.userId ?? user?.id ?? null,
    isLoading,
  };
}
