// app/hanzis/_components/AddHanziButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { HanziForm } from "./HanziForm";

export function AddHanziButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Hanzi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Hanzi</DialogTitle>
          <DialogDescription>
            Fill in the details for a new Chinese character
          </DialogDescription>
        </DialogHeader>
        <HanziForm
          onCancel={() => {
            //  setIsOpen(false)
          }}
          onSubmit={() => {
            // setIsOpen(false);
            // Optional: Add success toast here
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
