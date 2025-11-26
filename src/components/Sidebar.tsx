import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Bike,
  Building2,
  Wrench,
  Package,
  Tag,
  FileText,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  Receipt,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface MenuItem {
  to?: string
  icon: any
  label: string
  children?: { to: string; label: string }[]
}

const menuItems: MenuItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/veiculos', icon: Bike, label: 'Veículos' },
  { to: '/fornecedores', icon: Building2, label: 'Fornecedores' },
  { to: '/mecanicos', icon: Wrench, label: 'Mecânicos' },
  { to: '/produtos-lista', icon: Package, label: 'Produtos' },
  { to: '/tipos-servicos', icon: Tag, label: 'Tipos de Serviços' },
  { to: '/ordens-servico', icon: FileText, label: 'Ordens de Serviço' },
  { to: '/vendas', icon: ShoppingCart, label: 'Vendas' },
  { to: '/estoque', icon: Warehouse, label: 'Estoque' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/agendamentos', icon: Calendar, label: 'Agendamentos' },
  {
    icon: Receipt,
    label: 'Fiscal',
    children: [
      { to: '/fiscal/dashboard', label: 'Dashboard' },
      { to: '/fiscal/nfce', label: 'Emitir NFC-e' },
      { to: '/fiscal/nfe', label: 'Emitir NF-e' },
      { to: '/fiscal/historico', label: 'Histórico' },
      { to: '/fiscal/configuracao', label: 'Configuração' },
    ],
  },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const [fiscalOpen, setFiscalOpen] = useState(false)

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col">
      <div className="p-6 border-b border-primary-800">
        <div className="flex items-center space-x-3">
          <Bike className="w-8 h-8" />
          <div>
            <h1 className="font-heading font-bold text-lg">Oficina</h1>
            <p className="text-xs text-primary-300">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.children ? (
                // Item com submenu
                <div>
                  <button
                    onClick={() => setFiscalOpen(!fiscalOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-primary-200 hover:bg-primary-800 hover:text-white"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {fiscalOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {fiscalOpen && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-700 text-white'
                                : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                              }`
                            }
                          >
                            <span className="text-sm">{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Item normal
                <NavLink
                  to={item.to!}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-800">
        <p className="text-xs text-primary-300 text-center">
          © 2024 Sistema de Oficina
        </p>
      </div>
    </aside>
  )
}
