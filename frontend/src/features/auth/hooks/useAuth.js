import { useDispatch, useSelector } from "react-redux";
import { register, login, getMe } from "../services/auth.api";
import { setUser, setLoading, setError, clearError } from "../slices/auth.slice";

export function useAuth() {

      const dispatch = useDispatch();

      /**
       * Handles user registration
       * @param {Object} credentials - User credentials
       * @param {string} credentials.email - User email
       * @param {string} credentials.username - User username
       * @param {string} credentials.password - User password
       * @returns {Promise<Object>} - User data
      */
      async function handleRegister({ email, username, password }) {
            try {

                  dispatch(setLoading(true));
                  dispatch(clearError());
                  const data = await register({ email, username, password });
                  dispatch(setUser(data?.user));

            } catch (error) {

                  dispatch(setError(error?.response?.data || "Unexpected Error happend!"));
                  throw error;

            }
            finally {
                  dispatch(setLoading(false));
            }
      }


      /**
       * Handles user login
       * @param {Object} credentials - User credentials
       * @param {string} credentials.email - User email
       * @param {string} credentials.password - User password
       * @returns {Promise<Object>} - User data
      */

      async function handleLogin({ email, password }) {
            try {

                  dispatch(setLoading(true));
                  // Clear out any stale error before this attempt — otherwise a
                  // previous failed login, or the 401 every logged-out visitor
                  // gets from the initial getMe check, lingers in the store
                  // forever and can resurface even after a successful login.
                  dispatch(clearError());
                  const data = await login({ email, password });
                  dispatch(setUser(data.user));

            }
            catch (error) {

                  dispatch(setError(error?.response?.data || "Unexpected Error happend!"));
                  throw error;

            }
            finally {
                  dispatch(setLoading(false));
            }
      }

      /**
       * Handles get me request
       * @returns {Promise<Object>} - User data
      */
      async function handleGetMe() {
            try {

                  dispatch(setLoading(true));
                  const data = await getMe();
                  dispatch(setUser(data.user));
                  dispatch(clearError());

            } catch (error) {

                  dispatch(setUser(null));
                  dispatch(setError(error?.response?.data || "Unexpected Error happend!"));
                  throw error;

            }
            finally {
                  dispatch(setLoading(false));
            }
      }

      return {
            handleGetMe,
            handleRegister,
            handleLogin
      }
}