/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { radicalSchema } from "@/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod"

interface AddRadicalButtonProps {
//   onSave: (radical: Omit<Radical, "id">) => Promise<void> | void;
onSave: () => void
}


export const radicalSchema = z.object({
  id: z.number().optional(),
  radical: z.string()
    .min(1, "Radical character is required")
    .max(2, "Radical cannot exceed 2 characters"),
  stroke_count: z.number()
    .int("Must be a whole number")
    .min(1, "Minimum 1 stroke")
    .max(20, "Maximum 20 strokes"),
  name_zh: z.string()
    .min(1, "Chinese name is required")
    .max(20, "Name too long"),
  name_en: z.string()
    .min(1, "English name is required")
    .max(30, "Name too long"),
  pinyin: z.string()
    .min(1, "Pinyin is required")
    .max(50, "Pinyin too long")
    .regex(/^[a-zA-ZÀ-ÿ\s\d]+$/, "Invalid pinyin characters")
});

export type Radical = z.infer<typeof radicalSchema>;

export function AddRadicalButton({ onSave }: AddRadicalButtonProps) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(radicalSchema),
    defaultValues: {
      radical: "",
      stroke_count: 0,
      name_zh: "",
      name_en: "",
      pinyin: "",
    },
  });

  const handleSubmit = async (values: any) => {
    // await onSave(values);
    console.log("values: ", values)
    onSave()
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Radical
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Radical</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="radical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radical</FormLabel>
                    <FormControl>
                      <Input placeholder="氵" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stroke_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stroke Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name_zh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chinese Name</FormLabel>
                  <FormControl>
                    <Input placeholder="三点水" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Water Radical" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pinyin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pinyin</FormLabel>
                  <FormControl>
                    <Input placeholder="sān diǎn shuǐ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Radical</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}