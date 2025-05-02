/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { revalidatePath } from "next/cache";
import { Hanzi } from "../(dashboard)/hanzis/_components/types";

interface HanziInput {
  id: number;
  standard_character: string;
  traditional_character: string | null;
  is_identical: boolean;
  pinyin: { pronunciation: string }[];
  definition: string;
  simplified_stroke_count: number;
  hsk_level: number;
  frequency_rank?: number | null;
  simplified_radical_ids: { kangxi_id: number }[];
  traditional_radical_ids: { kangxi_id: number }[] | null;
}

interface HanziResponse {
  error: string | null;
  success: boolean;
  data: any | null;
}

export async function saveHanzis(data: HanziInput[]): Promise<HanziResponse> {
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

  try {
    // Simply add user_id to each hanzi record
    const insertPayload = data.map((hanzi) => ({
      ...hanzi,
      user_id: user.id,
    }));

    const { data: dbData, error: dbError } = await supabase
      .from("hanzis")
      .insert(insertPayload)
      .select();

    if (dbError) {
      console.error("Supabase error:", dbError);
      throw dbError;
    }

    // Revalidate paths
    revalidatePath("/hanzis");
    revalidatePath("/dashboard/hanzis");

    return {
      error: null,
      success: true,
      data: dbData,
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

interface GetHanzisParams {
  limit?: number;
  page?: number;
  hsk_level?: number;
  character_type?: "identical" | "simplified" | "traditional";
  search_term?: string;
}

interface PaginatedHanzisResponse {
  data: Hanzi[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  error?: string;
}

export async function getHanzis(
  params?: GetHanzisParams
): Promise<PaginatedHanzisResponse> {
  const cacheOptions = {
    cache: "force-cache",
    next: { tags: ["hanzis"] },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      total_pages: 0,
      error: "Unauthorized - You must be logged in to view hanzis",
    };
  }

  try {
    // Set default pagination values
    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("hanzis")
      .select(
        `
        id,
        created_at,
        standard_character,
        traditional_character,
        is_identical,
        pinyin,
        definition,
        simplified_stroke_count,
        traditional_stroke_count,
        hsk_level,
        frequency_rank,
        simplified_radical_ids,
        traditional_radical_ids
      `,
        { count: "exact" } // Get total count for pagination
      )
      // .eq("user_id", user.id)
      .order("frequency_rank", { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (params?.hsk_level) {
      query = query.eq("hsk_level", params.hsk_level);
    }
    if (params?.character_type) {
      query = query.eq("is_identical", params.character_type === "identical");
    }
    if (params?.search_term) {
      query = query.ilike("standard_character", `%${params.search_term}%`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    // Transform database fields to match Hanzi type
    // const formattedData = data?.map((hanzi) => ({
    //   ...hanzi,
    //   // simplified_radical_ids: hanzi.standard_radical_ids, // Map to expected field
    //   // traditional_radical_ids: hanzi.traditional_radical_ids, // Keep same name
    // })) as Hanzi[];

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Failed to fetch hanzis:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      total_pages: 0,
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}

export async function updateHanzi(id: number, data: Partial<Hanzi>) {
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

  console.log("update Hanzi", data)
  const { data: updatedHanzi, error } = await supabase
    .from('hanzis')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate cached paths
  revalidatePath("/hanzis");
  revalidatePath("/dashboard/hanzis");
  return { success: true, data: updatedHanzi };
}

export async function deleteHanzi(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized - You must be logged in to delete hanzis");
    }

    // First verify the hanzi exists and belongs to this user
    const { data: existing, error: fetchError } = await supabase
      .from("hanzis")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      throw new Error("Hanzi not found or access denied");
    }

    // Execute the delete operation
    const { error } = await supabase
      .from("hanzis")
      .delete()
      .match({ id, user_id: user.id }); // Double-check user ownership

    if (error) {
      throw new Error(error.message || "Failed to delete hanzi");
    }

    // Revalidate cached paths
    revalidatePath("/hanzis");
    revalidatePath("/dashboard/hanzis");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete hanzi:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
