import React from 'react'
import { router } from './app/app.routes';
import { RouterProvider } from 'react-router';

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;