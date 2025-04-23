// stores/useRadicalDialogStore.ts
import { Radical } from "@/app/(dashboard)/radicals/_components/RadicalsTable";
import { create } from "zustand";

interface RadicalDialogState {
  isOpen: boolean;
  editingRadical?: Radical; // Only undefined
  openDialog: (radical?: Radical) => void; // Only undefined
  closeDialog: () => void;
}

const useRadicalDialogStore = create<RadicalDialogState>((set) => ({
  isOpen: false,
  editingRadical: undefined, // Initialize as undefined

  openDialog: (radical) => {
    set({ isOpen: true, editingRadical: radical });
  },

  closeDialog: () => {
    set({ isOpen: false, editingRadical: undefined });
  },
}));

  export default useRadicalDialogStore;