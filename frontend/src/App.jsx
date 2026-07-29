import React, { useEffect } from 'react'
import { router } from './app/app.routes';
import { RouterProvider } from 'react-router';
import useGetMe from './features/auth/hooks/useGetMe';
import { useSelector } from 'react-redux';

function App() {

  /**
   * fetching the current user data
   * hydrate the user
   */
  useGetMe();

  const theme = useSelector(state => state.theme.value);

  /** set current theme to localstorage for persistence globally */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <RouterProvider router={router} />
  )
}

export default App;