import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { appStore } from './stores/app.store.js'

import './global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={appStore}>
    <App />
  </Provider>
)
