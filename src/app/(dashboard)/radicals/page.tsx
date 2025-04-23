// app/radicals/page.tsx
import { RadicalsTable } from "./_components/RadicalsTable";
import { AddRadicalButton } from "./_components/AddRadicalButton";
import { getRadicals } from "@/app/actions/radicals-actions";

export default async function RadicalsPage() {
  
  // Call the backend function directly
  const { success, data: radicals, error } = await getRadicals();

  if (!success || !radicals) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Radicals</h1>
          <AddRadicalButton />
        </div>
        <p className="text-red-500">{error || "Failed to load radicals"}</p>
      </div>
    );
  }

  // console.log("radicals: ", radicals)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Radicals</h1>
        <AddRadicalButton />
      </div>
      
      <RadicalsTable
        radicals={radicals}
      />
    </div>
  );
}