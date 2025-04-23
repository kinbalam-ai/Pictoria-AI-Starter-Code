// app/radicals/_components/AddRadicalButton.tsx
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
import useRadicalDialogStore from "@/store/useRadicalDialogStore";
import { RadicalForm } from "./RadicalForm";

export function AddRadicalButton() {
  const { isOpen, editingRadical, closeDialog, openDialog } = useRadicalDialogStore();

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
            // Explicitly clear any editing state when opening for new radical
            if (editingRadical) {
              closeDialog();
            } else {
              openDialog()
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Add Radical
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
        <DialogTitle className="text-xl">
            {editingRadical 
              ? `Editing Radical #${editingRadical.kangxi_number}` 
              : "Add New Radical"}
          </DialogTitle>
          <DialogDescription>
            {editingRadical
              ? "Modify the details of this radical"
              : "Fill in the details for a new radical"}
          </DialogDescription>
        </DialogHeader>
        <RadicalForm 
          key={editingRadical?.id || 'new'} // Force re-render when switching modes
          initialValues={editingRadical}
          onCancel={closeDialog}
          // onSubmit={() => {
          //   closeDialog();
          //   // Optional: Add success toast here
          // }}
        />
      </DialogContent>
    </Dialog>
  );
}