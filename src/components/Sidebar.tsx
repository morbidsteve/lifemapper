import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  GitFork,
  Plus,
} from 'lucide-react';
import type { ViewType } from '../types';
import useStore from '../store/useStore';

const navItems: { view: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'board', label: 'Board', icon: KanbanSquare },
  { view: 'timeline', label: 'Timeline', icon: Calendar },
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'decisions', label: 'Decisions', icon: GitFork },
];

export default function Sidebar() {
  const currentView = useStore((s) => s.currentView);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const properties = useStore((s) => s.properties);
  const setShowAddPropertyModal = useStore((s) => s.setShowAddPropertyModal);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-primary-50 h-screen sticky top-0">
        <div className="p-4 border-b border-primary-50">
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span className="text-2xl">&#127793;</span>
            LifeMapper
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === view
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-light hover:bg-primary-50 hover:text-primary-dark'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-50">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 px-3">
            Properties
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-light rounded-md hover:bg-primary-50"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: prop.color }}
                />
                <span className="truncate">{prop.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAddPropertyModal(true)}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary-50 rounded-lg"
          >
            <Plus size={16} />
            Add Property
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-primary-50 z-30 flex">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-all ${
              currentView === view
                ? 'text-primary'
                : 'text-text-muted'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
