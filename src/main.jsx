import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PitchChatbot from './components/PitchChatbot'
import './index.css'
import './club.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PitchChatbot />
  </React.StrictMode>,
)
