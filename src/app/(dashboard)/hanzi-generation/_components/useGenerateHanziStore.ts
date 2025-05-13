// useGenerateHanziStore.ts
import { create } from "zustand";
import { toast } from "sonner";
import {
  generateHanziImage as generateHanziImageAction,
  storeHanziImages,
} from "@/app/actions/hanzi-image-actions";

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

interface HanziCharacter {
  standard_character: string;
  traditional_character?: string;
  definition?: string;
  pinyin?: string;
  
}

interface GenerateHanziState {
  // Generation state
  loading: boolean;
  images: Array<{ url: string } & GenerateHanziFormValues>;
  error: string | null;
  
  // Character state
  hanziData: HanziCharacter | null;
  showTraditional: boolean;
  base64Canvas: string | null;
  
  // Actions
  generateHanzi: (values: GenerateHanziFormValues) => Promise<void>;
  setBase64Canvas: (data: string) => void;
  reset: () => void;

  displayedCharacter: string; 
  setDisplayedCharacter: (char: string) => void; 
}

const initialState = {
  loading: false,
  images: [],
  error: null,
  hanziData: null,
  showTraditional: false,
  currentCharacter: '',
  base64Canvas: null,
};

const useGenerateHanziStore = create<GenerateHanziState>((set) => ({
  ...initialState,

  displayedCharacter: "", // <-- Default empty string
  setDisplayedCharacter: (char) => set({ displayedCharacter: char }), // <-- Simple setter

  // Generate AI images
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

  

  

  // Store the canvas image
  setBase64Canvas: (data: string) => {
    set({ base64Canvas: data });
  },

  // Reset all state
  reset: () => {
    set(initialState);
  },
}));

export const useDisplayedCharacter = () => 
  useGenerateHanziStore(state => state.displayedCharacter);

export const useSetDisplayedCharacter = () =>
  useGenerateHanziStore(state => state.setDisplayedCharacter);

export const useShowTraditional = () => 
  useGenerateHanziStore(state => state.showTraditional);

export const useHanziData = () => 
  useGenerateHanziStore(state => state.hanziData);

export const useGenerationState = () => 
  useGenerateHanziStore(state => ({
    loading: state.loading,
    images: state.images,
    error: state.error,
  }));

export default useGenerateHanziStore;