// app/actions/saveRadical.ts
"use server";

import { RadicalFormValues } from "../(dashboard)/radicals/_components/radical-schema";

// import { createClient } from "@/lib/supabase/server";
// import { z } from "zod";
// import { redirect } from "next/navigation";

// Reuse your Zod schema for server-side validation
// const radicalSchema = z.object({
//   forms: z.array(
//     z.object({
//       variant: z.string().min(1).max(2),
//       strokes: z.number().min(1).max(20),
//     })
//   ),
//   pinyin: z.array(
//     z.object({
//       pronunciation: z.string().min(1),
//     })
//   ),
//   kangxi_number: z.number().min(1).max(214),
//   hsk_level: z.number().min(1).max(6),
//   name_en: z.string().min(1),
//   meaning: z.string().min(1),
// });

export async function saveRadical(values: RadicalFormValues | FormData) {
    console.log("formData values: ", values)
//   const supabase = createClient();

//   // Parse and validate the form data
//   const rawFormData = {
//     forms: JSON.parse(formData.get("forms") as string),
//     pinyin: JSON.parse(formData.get("pinyin") as string),
//     kangxi_number: Number(formData.get("kangxi_number")),
//     hsk_level: Number(formData.get("hsk_level")),
//     name_en: formData.get("name_en") as string,
//     meaning: formData.get("meaning") as string,
//   };

  // Server-side validation
//   const validation = radicalSchema.safeParse(rawFormData);
//   if (!validation.success) {
//     return {
//       errors: validation.error.flatten().fieldErrors,
//       message: "Validation failed. Please check your input.",
//     };
//   }

  // Insert into Supabase
//   const { data, error } = await supabase
//     .from("radicals")
//     .insert([
//       {
//         forms: validation.data.forms,
//         pinyin: validation.data.pinyin,
//         kangxi_number: validation.data.kangxi_number,
//         name_en: validation.data.name_en,
//         meaning: validation.data.meaning,
//         hsk_level: validation.data.hsk_level,
//       },
//     ])
//     .select();

//   if (error) {
//     console.error("Error saving radical:", error);
//     return {
//       message: `Database Error: Failed to save radical. ${error.message}`,
//     };
//   }

//   redirect("/radicals"); // Or wherever you want to redirect after success
}