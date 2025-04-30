// app/hanzis/page.tsx
import { getHanzis } from "@/app/actions/hanzi-actions";
import { AddHanziButton } from "./_components/AddHanziButton";
import { HanziTable } from "./_components/HanziTable";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function HanzisPage() {
  const { success, data: hanzis, error } = await getHanzis();

  console.log("HANZI DATA: ", hanzis)

  if (!success || !hanzis) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hanzis</h1>
          <AddHanziButton />
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-red-500">
            {error || "Failed to load hanzis. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hanzis</h1>
        <AddHanziButton />
      </div>
      
      <ErrorBoundary fallback={<div className="text-red-500">Failed to render hanzis table</div>}>
        <Suspense fallback={<LoadingSkeleton />}>
          <HanziTable hanzis={hanzis} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}