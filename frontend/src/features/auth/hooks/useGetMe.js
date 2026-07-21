import { useAuth } from "./useAuth";
import { useEffect } from "react";

/**
 * Hook to fetch the current user's data
 * @returns {void}
*/
function useGetMe() {

      const { handleGetMe } = useAuth();

      useEffect(() => {
            handleGetMe();
      }, []);

}

export default useGetMe;