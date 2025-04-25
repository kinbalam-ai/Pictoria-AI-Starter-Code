/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/hanziActions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
// import { createClientWithOptions } from "@/lib/supabase/server-fetch";
// import { revalidatePath } from "next/cache";

// interface HanziInput {
//   standard_character: string;
//   traditional_character?: string | null;
//   is_identical: boolean;
//   pinyin: { pronunciation: string }[];
//   definition: string;
//   stroke_count: number;
//   hsk_level: number;
//   frequency_rank?: number | null;
//   standard_radical_ids: { id: number; name: string }[];
//   traditional_radical_ids?: { id: number; name: string }[] | null;
// }

interface HanziResponse {
  error: string | null;
  success: boolean;
  data: any | null;
}

export async function saveHanzis(
  data: any[]
): Promise<HanziResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Unauthorized - You must be logged in to save hanzis",
      success: false,
      data: null,
    };
  }

  console.log("HANZI data: ", data)

  try {
    // // Format the insert data
    // const insertPayload = data.map((hanzi) => ({
    //   standard_character: hanzi.standard_character,
    //   traditional_character: hanzi.traditional_character,
    //   is_identical: hanzi.is_identical,
    //   pinyin: hanzi.pinyin,
    //   definition: hanzi.definition,
    //   stroke_count: hanzi.stroke_count,
    //   hsk_level: hanzi.hsk_level,
    //   frequency_rank: hanzi.frequency_rank,
    //   standard_radical_ids: hanzi.standard_radical_ids,
    //   traditional_radical_ids: hanzi.traditional_radical_ids,
    //   user_id: user.id,
    // }));

    // // Insert all hanzis in a single transaction
    // const { data: dbData, error: dbError } = await supabase
    //   .from("hanzis")
    //   .insert(insertPayload)
    //   .select();

    // if (dbError) {
    //   console.error("Supabase error:", dbError);
    //   throw dbError;
    // }

    // // Revalidate paths
    // revalidatePath("/hanzis");
    // revalidatePath("/dashboard/hanzis");

    return {
      error: null,
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Failed to save hanzis:", error);
    return {
      error: error instanceof Error ? error.message : "Database error",
      success: false,
      data: null,
    };
  }
}

// export async function getHanzis(limit?: number, filters?: {
//   hsk_level?: number;
//   stroke_count?: number;
// }) {
//   const cacheOptions = {
//     cache: "force-cache",
//     next: {
//       tags: ["hanzis"],
//     },
//   };

//   const supabase = await createClientWithOptions(cacheOptions);
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return {
//       error: "Unauthorized",
//       success: false,
//       data: null,
//     };
//   }

//   let query = supabase
//     .from("hanzis")
//     .select(`
//       id,
//       created_at,
//       standard_character,
//       traditional_character,
//       is_identical,
//       pinyin,
//       definition,
//       stroke_count,
//       hsk_level,
//       frequency_rank,
//       standard_radical_ids,
//       traditional_radical_ids
//     `)
//     .eq("user_id", user.id)
//     .order("frequency_rank", { ascending: true });

//   // Apply filters if provided
//   if (filters?.hsk_level) {
//     query = query.eq("hsk_level", filters.hsk_level);
//   }
//   if (filters?.stroke_count) {
//     query = query.eq("stroke_count", filters.stroke_count);
//   }

//   if (limit) {
//     query = query.limit(limit);
//   }

//   const { data, error } = await query;

//   if (error) {
//     return {
//       error: error.message || "Failed to fetch hanzis",
//       success: false,
//       data: null,
//     };
//   }

//   // Format the data for easier consumption
//   const formattedHanzis = data.map((hanzi) => ({
//     ...hanzi,
//     primary_pinyin: hanzi.pinyin[0]?.pronunciation || "",
//     is_traditional: !hanzi.is_identical && hanzi.traditional_character !== null,
//   }));

//   return {
//     error: null,
//     success: true,
//     data: formattedHanzis || null,
//   };
// }

// export async function deleteHanzi(id: number) {
//   const supabase = await createClient();
//   const { data: { user }, error: authError } = await supabase.auth.getUser();

//   if (authError || !user) {
//     return {
//       error: "Unauthorized",
//       success: false,
//       message: "Failed to delete hanzi - not authenticated",
//       data: null
//     };
//   }

//   try {
//     const { error: deleteError, data } = await supabase
//       .from("hanzis")
//       .delete()
//       .eq("id", id)
//       .eq("user_id", user.id)
//       .select();

//     if (deleteError) {
//       return {
//         error: deleteError.message,
//         success: false,
//         message: "Database deletion failed",
//         data: null
//       };
//     }

//     revalidatePath("/hanzis");
//     revalidatePath("/dashboard/hanzis");

//     return {
//       error: null,
//       success: true,
//       message: "Hanzi deleted successfully",
//       data: data[0]
//     };

//   } catch (error) {
//     console.error("Failed to delete hanzi:", error);
//     return {
//       error: error instanceof Error ? error.message : "Unknown error",
//       success: false,
//       message: "Failed to delete hanzi",
//       data: null
//     };
//   }
// }

// export async function updateHanzi(id: number, updateData: Partial<HanziInput>) {
//   const supabase = await createClient();
//   const { data: { user }, error: authError } = await supabase.auth.getUser();

//   if (authError || !user) {
//     return {
//       error: "Unauthorized",
//       success: false,
//       data: null
//     };
//   }

//   try {
//     // Ensure we don't update user_id
//     const { user_id, ...cleanUpdateData } = updateData;

//     const { data, error: updateError } = await supabase
//       .from("hanzis")
//       .update(cleanUpdateData)
//       .eq("id", id)
//       .eq("user_id", user.id)
//       .select();

//     if (updateError) {
//       throw updateError;
//     }

//     revalidatePath("/hanzis");
//     revalidatePath(`/hanzis/${id}`);

//     return {
//       error: null,
//       success: true,
//       data: data[0]
//     };
//   } catch (error) {
//     console.error("Failed to update hanzi:", error);
//     return {
//       error: error instanceof Error ? error.message : "Update failed",
//       success: false,
//       data: null
//     };
//   }
// }