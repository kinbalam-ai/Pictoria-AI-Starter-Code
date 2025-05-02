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
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && closeDialog()}
    >
      <DialogTrigger asChild>
        <Button 
          className="gap-2"
          onClick={() => openDialog()}
        >
          <Plus className="h-4 w-4" />
          Add Radical
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingRadical
              ? `Edit Radical #${editingRadical.kangxi_number}`
              : "Add New Radical"}
          </DialogTitle>
          <DialogDescription>
            {editingRadical
              ? "Modify the details of this radical"
              : "Fill in the details for a new radical"}
          </DialogDescription>
        </DialogHeader>
        <RadicalForm
          key={editingRadical?.id || "new"}
          initialValues={editingRadical}
          onCancel={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
}