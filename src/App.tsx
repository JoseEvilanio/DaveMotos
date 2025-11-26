import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import Registro from '@/pages/Registro'
import Dashboard from '@/pages/Dashboard'
import Layout from '@/components/Layout'
import { lazy, Suspense } from 'react'
const Clientes = lazy(() => import('@/pages/Clientes'))
const Veiculos = lazy(() => import('@/pages/Veiculos'))
const Fornecedores = lazy(() => import('@/pages/Fornecedores'))
const Mecanicos = lazy(() => import('@/pages/Mecanicos'))
const Produtos = lazy(() => import('@/pages/Produtos'))
const ProdutosPage = lazy(() => import('@/pages/ProdutosPage'))
const ServicosPage = lazy(() => import('@/pages/ServicosPage'))
const TiposServicos = lazy(() => import('@/pages/TiposServicos'))
const OrdensServico = lazy(() => import('@/pages/OrdensServico'))
const Vendas = lazy(() => import('@/pages/Vendas'))
const Estoque = lazy(() => import('@/pages/Estoque'))
const Financeiro = lazy(() => import('@/pages/Financeiro'))
const Agendamentos = lazy(() => import('@/pages/Agendamentos'))
const Relatorios = lazy(() => import('@/pages/Relatorios'))
const Configuracoes = lazy(() => import('@/pages/Configuracoes'))
const ConfiguracaoFiscal = lazy(() => import('@/pages/ConfiguracaoFiscal'))
const EmissaoNFCe = lazy(() => import('@/pages/EmissaoNFCe'))
const EmissaoNFe = lazy(() => import('@/pages/EmissaoNFe'))
const HistoricoNotas = lazy(() => import('@/pages/HistoricoNotas'))
const DashboardFiscal = lazy(() => import('@/pages/DashboardFiscal'))
import LoadingScreen from '@/components/LoadingScreen'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/registro" element={!isAuthenticated ? <Registro /> : <Navigate to="/" />} />

          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Suspense fallback={<LoadingScreen />}><Clientes /></Suspense>} />
            <Route path="/veiculos" element={<Suspense fallback={<LoadingScreen />}><Veiculos /></Suspense>} />
            <Route path="/fornecedores" element={<Suspense fallback={<LoadingScreen />}><Fornecedores /></Suspense>} />
            <Route path="/mecanicos" element={<Suspense fallback={<LoadingScreen />}><Mecanicos /></Suspense>} />
            <Route path="/produtos" element={<Suspense fallback={<LoadingScreen />}><Produtos /></Suspense>} />
            <Route path="/produtos-lista" element={<Suspense fallback={<LoadingScreen />}><ProdutosPage /></Suspense>} />
            <Route path="/servicos" element={<Suspense fallback={<LoadingScreen />}><ServicosPage /></Suspense>} />
            <Route path="/tipos-servicos" element={<Suspense fallback={<LoadingScreen />}><TiposServicos /></Suspense>} />
            <Route path="/ordens-servico" element={<Suspense fallback={<LoadingScreen />}><OrdensServico /></Suspense>} />
            <Route path="/vendas" element={<Suspense fallback={<LoadingScreen />}><Vendas /></Suspense>} />
            <Route path="/estoque" element={<Suspense fallback={<LoadingScreen />}><Estoque /></Suspense>} />
            <Route path="/financeiro" element={<Suspense fallback={<LoadingScreen />}><Financeiro /></Suspense>} />
            <Route path="/agendamentos" element={<Suspense fallback={<LoadingScreen />}><Agendamentos /></Suspense>} />
            <Route path="/relatorios" element={<Suspense fallback={<LoadingScreen />}><Relatorios /></Suspense>} />
            <Route path="/configuracoes" element={<Suspense fallback={<LoadingScreen />}><Configuracoes /></Suspense>} />
            <Route path="/fiscal/configuracao" element={<Suspense fallback={<LoadingScreen />}><ConfiguracaoFiscal /></Suspense>} />
            <Route path="/fiscal/nfce" element={<Suspense fallback={<LoadingScreen />}><EmissaoNFCe /></Suspense>} />
            <Route path="/fiscal/nfe" element={<Suspense fallback={<LoadingScreen />}><EmissaoNFe /></Suspense>} />
            <Route path="/fiscal/historico" element={<Suspense fallback={<LoadingScreen />}><HistoricoNotas /></Suspense>} />
            <Route path="/fiscal/dashboard" element={<Suspense fallback={<LoadingScreen />}><DashboardFiscal /></Suspense>} />
          </Route>
        </Routes>
      </HashRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App
