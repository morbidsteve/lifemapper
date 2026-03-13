import { Settings, Download, Upload, Database } from 'lucide-react';
import { useRef, useState } from 'react';
import useStore from '../store/useStore';
import { useTotalStress, useCompletionPercentage } from '../hooks/useSelectors';

export default function TopBar() {
  const projects = useStore((s) => s.projects);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completionPct = useCompletionPercentage();
  const stressPct = useTotalStress();
  const activeCount = projects.filter((p) => p.status !== 'completed').length;

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifemapper-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSettings(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importData(text);
      setShowSettings(false);
    };
    reader.readAsText(file);
  };

  const stressColor =
    stressPct > 70 ? 'bg-stress-high' : stressPct > 40 ? 'bg-stress-medium' : 'bg-stress-low';

  return (
    <header className="bg-surface border-b border-primary-50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile logo */}
      <div className="md:hidden text-lg font-bold text-primary-dark flex items-center gap-2">
        <span className="text-xl">&#127793;</span>
        LifeMapper
      </div>

      {/* Progress section */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted uppercase tracking-wider">Progress</span>
          <div className="w-32 h-2 bg-primary-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-text">{completionPct}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted uppercase tracking-wider">Stress</span>
          <div className="w-24 h-2 bg-primary-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${stressColor}`}
              style={{ width: `${stressPct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-text">{stressPct}%</span>
        </div>

        <span className="text-sm text-text-light">
          {activeCount} active project{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Settings */}
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg text-text-light hover:bg-primary-50 hover:text-primary-dark"
        >
          <Settings size={20} />
        </button>

        {showSettings && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowSettings(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-lg border border-primary-50 z-40 py-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-50"
              >
                <Download size={16} />
                Export Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-50"
              >
                <Upload size={16} />
                Import Data
              </button>
              <hr className="my-1 border-primary-50" />
              <button
                onClick={() => {
                  loadSampleData();
                  setShowSettings(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary-50"
              >
                <Database size={16} />
                Load Sample Data
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </header>
  );
}
