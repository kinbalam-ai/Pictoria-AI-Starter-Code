// stores/useRadicalDialogStore.ts
import { Radical } from "@/app/(dashboard)/radicals/_components/types";
import { create } from "zustand";

interface RadicalDialogState {
  isOpen: boolean;
  editingRadical?: Radical | null;
  openDialog: (radical?: Radical) => void;
  closeDialog: () => void;
}

const useRadicalDialogStore = create<RadicalDialogState>((set) => ({
  isOpen: false,
  editingRadical: null,

  openDialog: (radical) => {
    set({ isOpen: true, editingRadical: radical || null });
  },

  closeDialog: () => {
    set({ isOpen: false, editingRadical: null });
  },
}));

export default useRadicalDialogStore;