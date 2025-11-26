import { Building2, User, Bell, Shield, Palette, Database } from 'lucide-react'

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Dados da Oficina</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Nome da Oficina</label>
              <input type="text" className="input" defaultValue="Moto Workshop" />
            </div>
            <div>
              <label className="label">CNPJ</label>
              <input type="text" className="input" placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input type="text" className="input" defaultValue="(00) 0000-0000" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" defaultValue="contato@oficina.com" />
            </div>
            <div>
              <label className="label">Endereço</label>
              <input type="text" className="input" defaultValue="Rua Exemplo, 123" />
            </div>
            <button className="btn btn-primary w-full">Salvar Alterações</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Meu Perfil</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Nome Completo</label>
              <input type="text" className="input" defaultValue="Administrador" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" defaultValue="admin@oficina.com" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input type="text" className="input" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="label">Nova Senha</label>
              <input type="password" className="input" placeholder="Deixe em branco para não alterar" />
            </div>
            <div>
              <label className="label">Confirmar Senha</label>
              <input type="password" className="input" placeholder="Confirme a nova senha" />
            </div>
            <button className="btn btn-primary w-full">Atualizar Perfil</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" defaultChecked />
              <span className="text-gray-700">Notificar sobre novos agendamentos</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" defaultChecked />
              <span className="text-gray-700">Alertas de estoque baixo</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" />
              <span className="text-gray-700">Notificar sobre pagamentos pendentes</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" defaultChecked />
              <span className="text-gray-700">Relatórios diários por email</span>
            </label>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-50">
              <Palette className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Aparência</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Tema</label>
              <select className="input">
                <option>Claro</option>
                <option>Escuro</option>
                <option>Automático</option>
              </select>
            </div>
            <div>
              <label className="label">Cor Primária</label>
              <div className="flex space-x-2">
                <button className="w-10 h-10 rounded-lg bg-blue-700 border-2 border-gray-300"></button>
                <button className="w-10 h-10 rounded-lg bg-green-700"></button>
                <button className="w-10 h-10 rounded-lg bg-purple-700"></button>
                <button className="w-10 h-10 rounded-lg bg-red-700"></button>
                <button className="w-10 h-10 rounded-lg bg-orange-700"></button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-red-50">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Segurança</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" defaultChecked />
              <span className="text-gray-700">Autenticação de dois fatores</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" defaultChecked />
              <span className="text-gray-700">Logout automático após inatividade</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" />
              <span className="text-gray-700">Exigir senha forte</span>
            </label>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gray-50">
              <Database className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Banco de Dados</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Banco: <span className="font-medium text-gray-900">PostgreSQL</span></p>
              <p className="text-sm text-gray-600">Status: <span className="font-medium text-green-600">• Conectado</span></p>
              <p className="text-sm text-gray-600">Último backup: <span className="font-medium text-gray-900">28/10/2025 08:00</span></p>
            </div>
            <button className="btn btn-secondary w-full">Fazer Backup Agora</button>
          </div>
        </div>
      </div>
    </div>
  )
}
