import { NavLink } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-emerald-400">Controle de Gastos</h1>
          <p className="text-xs text-gray-500 mt-1">Carol & João</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Início
          </NavLink>
          <NavLink
            to="/historico"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Histórico
          </NavLink>
          <NavLink
            to="/metas"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Metas
          </NavLink>
          <NavLink
            to="/estimativas"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Estimativas
          </NavLink>
          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            Configurações
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
