interface ElectronAPI {
  saveData: (data: unknown) => Promise<{ success: boolean; error?: string }>;
  loadData: () => Promise<{ success: boolean; data: unknown | null; error?: string }>;
  getDataPath: () => Promise<string>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
