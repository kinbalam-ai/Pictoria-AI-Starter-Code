// app/hanzis/_components/AddHanziButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import useHanziDialogStore from "@/store/useHanziDialogStore";
import { HanziForm } from "./HanziForm";

export function AddHanziButton() {
  const { isOpen, editingHanzi, closeDialog, openDialog } = useHanziDialogStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        closeDialog(); // Reset state when closing
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2"
          onClick={() => {
            // Explicitly clear any editing state when opening for new hanzi
            if (editingHanzi) {
              closeDialog();
            } else {
              openDialog()
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Add Hanzi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingHanzi
              ? `Edit Hanzi ${editingHanzi.standard_character}`
              : "Add New Hanzi"}
          </DialogTitle>
          <DialogDescription>
            {editingHanzi
              ? "Modify the details of this character"
              : "Fill in the details for a new character"}
          </DialogDescription>
        </DialogHeader>
        <HanziForm
          key={editingHanzi?.id || "new"}
          initialValues={editingHanzi}
          onCancel={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
