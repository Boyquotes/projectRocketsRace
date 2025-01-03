import { create } from 'zustand';

interface StoreState {
  command: string;
  setCommand: (newCommand: string) => void;
}

const useStore = create<StoreState>((set) => ({
  command: '',
  setCommand: (newCommand) => set({ command: newCommand }),
}));

export default useStore;