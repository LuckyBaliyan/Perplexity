import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loader from '../../shared/pages/Loader';

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
                  <Loader />
            )
      }

      if (!user) {
            return <Navigate to="/login" replace />
      }

      return children;
}

export default Protected