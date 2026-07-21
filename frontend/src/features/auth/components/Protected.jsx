import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

/**
 * Protected component to protect routes
 * @param {React.ReactNode} children - Children components
 * @returns {React.ReactNode} - Protected route
*/
function Protected({ children }) {
      const user = useSelector(state => state.auth.user);
      const loading = useSelector(state => state.auth.loading);

      if (loading) {
            return (
                  <div className="h-screen w-full flex items-center justify-center">
                        <h1 className="text-4xl text-white">Loading...</h1>
                  </div>
            )
      }

      if (!user) {
            return <Navigate to="/login" />
      }

      return children;
}

export default Protected