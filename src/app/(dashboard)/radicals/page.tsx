"use client"
import { RadicalsTable } from "./_components/RadicalsTable";
// import { AddRadicalButton } from "./_components/AddRadicalButton";
import { useState } from "react";
import { Radical } from "./_components/RadicalsTable";
import { AddRadicalButton } from "./_components/AddRadicalButton";

export default function RadicalsPage() {
  const [radicals, setRadicals] = useState<Radical[]>([]);
  const [editingRadical, setEditingRadical] = useState<Radical | null>(null);

//   const handleAdd = (newRadical: Omit<Radical, "id">) => {
//     setRadicals([...radicals, { ...newRadical, id: radicals.length + 1 }]);
//   };

//   const handleEdit = (updatedRadical: Radical) => {
//     setRadicals(
//       radicals.map((r) => (r.id === updatedRadical.id ? updatedRadical : r))
//     );
//     setEditingRadical(null);
//   };

  const handleDelete = (id: number) => {
    setRadicals(radicals.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Radicals</h1>
        {/* <AddRadicalButton onAdd={handleAdd} /> */}
        <AddRadicalButton onSave={() => {}} />
      </div>
      
      <RadicalsTable
        radicals={[]}
        onEdit={setEditingRadical}
        onDelete={handleDelete}
      />

      {/* Edit Dialog */}
      {/* {editingRadical && (
        <Dialog
          open={!!editingRadical}
          onOpenChange={(open) => !open && setEditingRadical(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Radical</DialogTitle>
            </DialogHeader>
            <RadicalForm
              onSubmit={handleEdit}
              onCancel={() => setEditingRadical(null)}
              defaultValues={editingRadical}
            />
          </DialogContent>
        </Dialog>
      )} */}
    </div>
  );
}