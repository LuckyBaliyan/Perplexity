import { useDispatch, useSelector } from "react-redux";
import { register, login, getMe } from "../services/auth.api";
import { setUser, setLoading, setError } from "../slices/auth.slice";

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
                  const data = await register({ email, username, password });
                  dispatch(setUser(data?.user));

            } catch (error) {

                  dispatch(setError(error.response?.data?.message || error.message));
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
                  const data = await login({ email, password });
                  dispatch(setUser(data.user))

            }
            catch (error) {

                  dispatch(setError(error.response?.data?.message || error.message));
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

            } catch (error) {

                  dispatch(setUser(null));
                  dispatch(setError(error.response?.data?.message || error.message));
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