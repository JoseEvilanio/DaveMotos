import React from 'react'
import ReactDOM from 'react-dom/client'

// Teste simples sem React Router
function App() {
  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'Arial', 
      fontSize: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>🏍️ Sistema de Oficina de Motos</h1>
      <p>✅ React está funcionando!</p>
      <p>✅ Electron está funcionando!</p>
      <p>✅ O sistema está carregando corretamente!</p>
      <button 
        onClick={() => alert('Botão funcionando!')}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Testar Interação
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
