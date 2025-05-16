/* eslint-disable @typescript-eslint/no-explicit-any */
// useGenerateHanziStore.ts
import { create } from "zustand";
// import { toast } from "sonner";
import {
  generateControlNetScribble,
  generateImg2PaintControlNet,
  GenerationResponse,
} from "@/app/actions/hanzi-image-actions";
import { toast } from "sonner";

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

interface PinyinObject {
  pronunciation: string;
  // Add other pinyin properties if needed
}

interface HanziCharacter {
  standard_character: string;
  traditional_character?: string;
  definition?: string;
  pinyin?: PinyinObject[];
}

interface GenerateHanziState {
  // Generation state
  loading: boolean;
  isLoading: boolean;
  images: Array<{ url: string } & GenerateHanziFormValues>;
  error: string | null;

  // Character state
  hanziData: HanziCharacter | null;
  showTraditional: boolean;
  base64Canvas: string | null;
  selectedPronunciations: string[]; // New state for selected pronunciations

  // Actions
  generateHanzi: (values: any) => Promise<void>;
  setBase64Canvas: (data: string) => void;
  reset: () => void;

  togglePronunciation: (pronunciation: string) => void; // New action

  setSelectedPronunciations: (pronunciations: string[]) => void; // New action;
  clearSelectedPronunciations: () => void; // New action

  displayedCharacter: string;
  setDisplayedCharacter: (char: string) => void;

  canvasImage: string | null;
  setCanvasImage: (image: string | null) => void;
}

const initialState = {
  loading: false,
  isLoading: false,
  images: [],
  error: null,
  hanziData: null,
  showTraditional: false,
  base64Canvas: null,
  selectedPronunciations: [], // Added to initial state
};

const useGenerateHanziStore = create<GenerateHanziState>((set, get) => ({
  ...initialState,

  displayedCharacter: "",
  setDisplayedCharacter: (char) => set({ displayedCharacter: char }),

  canvasImage: null,
  setCanvasImage: (image) => set({ canvasImage: image }),

  setSelectedPronunciations: (pronunciationsArray) =>
    set({ selectedPronunciations: pronunciationsArray }),

  // New pronunciation actions
  togglePronunciation: (pronunciation) => {
    const current = get().selectedPronunciations;
    set({
      selectedPronunciations: current.includes(pronunciation)
        ? current.filter((p) => p !== pronunciation)
        : [...current, pronunciation],
    });
  },

  clearSelectedPronunciations: () => set({ selectedPronunciations: [] }),

  // Generate AI images
  generateHanzi: async (values) => {
    set({ loading: true, error: null });
    const toastId = toast.loading("Generating image...");

    try {
      let result: GenerationResponse;
      switch (values.model) {
        case "jagilley/controlnet-scribble":
          result = await generateControlNetScribble(values);
          break;
        case "qr2ai/img2paint_controlnet":
          result = await generateImg2PaintControlNet(values);
          break;
        default:
          throw new Error(`Unsupported model: ${values.model}`);
      }
      console.log("#####################RESULT: ", result)
      if (!result.success) {
        set({ error: result.error, loading: false });
        toast.error(result.error, { id: toastId });
        return;
      }
      const dataWithInputs = Array.isArray(result.data)
        ? result.data.map((url: string) => ({
            url,
            ...values,
          }))
        : [];

      console.log("dataWithInputs: ", dataWithInputs);
      set({ images: dataWithInputs, loading: false });
      toast.success("Image generated successfully", { id: toastId });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Generation failed" });
      console.error("Generation error:", err);
    } finally {
      set({ isLoading: false });
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

// Selector exports
export const useDisplayedCharacter = () =>
  useGenerateHanziStore((state) => state.displayedCharacter);

export const useSetDisplayedCharacter = () =>
  useGenerateHanziStore((state) => state.setDisplayedCharacter);

export const useCanvasImage = () =>
  useGenerateHanziStore((state) => state.canvasImage);

export const useSetCanvasImage = () =>
  useGenerateHanziStore((state) => state.setCanvasImage);

export const useSelectedPronunciations = () =>
  useGenerateHanziStore((state) => state.selectedPronunciations);

export const useGenerateHanzi = () =>
  useGenerateHanziStore((state) => state.generateHanzi);

// export const useTogglePronunciation = () =>
//   useGenerateHanziStore(state => state.togglePronunciation);

export const useSetSelectedPronunciations = () =>
  useGenerateHanziStore((state) => state.setSelectedPronunciations);

export const useClearSelectedPronunciations = () =>
  useGenerateHanziStore((state) => state.clearSelectedPronunciations);

export const useShowTraditional = () =>
  useGenerateHanziStore((state) => state.showTraditional);

export const useHanziData = () =>
  useGenerateHanziStore((state) => state.hanziData);

export const useGenerationState = () =>
  useGenerateHanziStore((state) => ({
    loading: state.loading,
    images: state.images,
    error: state.error,
  }));

export default useGenerateHanziStore;
