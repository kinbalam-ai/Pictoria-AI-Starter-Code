// stores/useHanziDialogStore.ts
import { Hanzi } from "@/app/(dashboard)/hanzis/_components/types";
import { create } from "zustand";

interface HanziDialogState {
  isOpen: boolean;
  editingHanzi?: Hanzi;
  openDialog: (hanzi?: Hanzi) => void;
  closeDialog: () => void;
}

const useHanziDialogStore = create<HanziDialogState>((set) => ({
  isOpen: false,
  editingHanzi: undefined,

  openDialog: (hanzi) => {
    set({ isOpen: true, editingHanzi: hanzi });
  },

  closeDialog: () => {
    set({ isOpen: false, editingHanzi: undefined });
  },
}));

export default useHanziDialogStore;
