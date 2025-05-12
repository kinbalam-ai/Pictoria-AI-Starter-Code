// useGenerateHanziStore.ts
import { create } from "zustand";
import { toast } from "sonner";
import {
  generateHanziImage as generateHanziImageAction,
  storeHanziImages,
} from "@/app/actions/hanzi-image-actions";

interface GenerateHanziState {
  loading: boolean;
  images: Array<{ url: string } & GenerateHanziFormValues>;
  error: string | null;
  generateHanzi: (values: GenerateHanziFormValues) => Promise<void>;
}

interface GenerateHanziFormValues {
  model: string;
  prompt: string;
  num_inference_steps: number;
  num_outputs: number;
  guidance: number;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
}

const useGenerateHanziStore = create<GenerateHanziState>((set) => ({
  loading: false,
  images: [],
  error: null,

  generateHanzi: async (values: GenerateHanziFormValues) => {
    set({ loading: true, error: null });
    const toastId = toast.loading("Generating Hanzi image...");

    try {
      const {
        data: output,
        error,
        success,
      } = await generateHanziImageAction(values);

      if (!success) {
        set({ error: error, loading: false });
        toast.error(error, { id: toastId });
        return;
      }

      const dataWithInputs = Array.isArray(output)
        ? output.map((url: string) => ({
            url,
            ...values,
          }))
        : [];

      set({ images: dataWithInputs, loading: false });
      toast.success("Hanzi generated successfully", { id: toastId });

      await storeHanziImages(dataWithInputs);
      toast.success("Hanzi images stored successfully");
    } catch (error) {
      console.error(error);
      set({
        error: "Failed to generate Hanzi. Please try again.",
        loading: false,
      });
      toast.error("Failed to generate Hanzi. Please try again.", {
        id: toastId,
      });
    }
  },
}));

export default useGenerateHanziStore;
