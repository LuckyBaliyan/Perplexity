import React from 'react'
import { router } from './app/app.routes';
import { RouterProvider } from 'react-router';
import useGetMe from './features/auth/hooks/useGetMe';

function App() {

  /**
   * fetching the current user data
   * hydrate the user
   */
  useGetMe();

  return (
    <RouterProvider router={router} />
  )
}

export default App;