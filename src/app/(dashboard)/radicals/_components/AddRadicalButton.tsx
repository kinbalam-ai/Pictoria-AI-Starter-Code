/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { RadicalForm } from "./RadicalForm";
// import type { RadicalFormValues } from "./radical-schema";

export function AddRadicalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Radical
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Radical</DialogTitle>
        </DialogHeader>
        <RadicalForm
          onSubmit={async () => {
            // await onSave(values);
            // setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
