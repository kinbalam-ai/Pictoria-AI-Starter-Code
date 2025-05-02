/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { revalidatePath } from "next/cache";

interface RadicalInput {
  forms: { variant: string; strokes: number }[];
  pinyin: { pronunciation: string }[];
  kangxi_number: number;
  hsk_level: number;
  name_en: string;
  meaning: string;
}

interface RadicalResponse {
  error: string | null;
  success: boolean;
  data: any | null;
}

interface GetRadicalsParams {
  limit?: number;
  page?: number;
  hsk_level?: number;
  search_term?: string;
}

interface PaginatedRadicalsResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  error?: string;
}

export async function saveRadicals(
  data: RadicalInput[]
): Promise<RadicalResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Unauthorized - You must be logged in to save radicals",
      success: false,
      data: null,
    };
  }

  try {
    const insertPayload = data.map((radical) => ({
      ...radical,
      user_id: user.id,
    }));

    const { data: dbData, error: dbError } = await supabase
      .from("radicals")
      .insert(insertPayload)
      .select();

    if (dbError) {
      console.error("Supabase error:", dbError);
      throw dbError;
    }

    revalidatePath("/radicals");
    revalidatePath("/dashboard/radicals");

    return {
      error: null,
      success: true,
      data: dbData,
    };
  } catch (error) {
    console.error("Failed to save radicals:", error);
    return {
      error: error instanceof Error ? error.message : "Database error",
      success: false,
      data: null,
    };
  }
}

export async function getRadicals(
  params?: GetRadicalsParams
): Promise<PaginatedRadicalsResponse> {
  const cacheOptions = {
    cache: "force-cache",
    next: { tags: ["radicals"] },
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
      error: "Unauthorized - You must be logged in to view radicals",
    };
  }

  try {
    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("radicals")
      .select(
        `
        id,
        created_at,
        forms,
        pinyin,
        kangxi_number,
        name_en,
        meaning,
        hsk_level
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("kangxi_number", { ascending: true })
      .range(offset, offset + limit - 1);

    if (params?.hsk_level) {
      query = query.eq("hsk_level", params.hsk_level);
    }
    if (params?.search_term) {
      query = query.or(
        `name_en.ilike.%${params.search_term}%,meaning.ilike.%${params.search_term}%`
      );
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Failed to fetch radicals:", error);
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

export async function updateRadical(id: number, data: Partial<RadicalInput>) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Unauthorized - You must be logged in to update radicals",
      success: false,
      data: null,
    };
  }

  const { data: updatedRadical, error } = await supabase
    .from("radicals")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/radicals");
  revalidatePath("/dashboard/radicals");
  return { success: true, data: updatedRadical };
}

export async function deleteRadical(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        "Unauthorized - You must be logged in to delete radicals"
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("radicals")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      throw new Error("Radical not found or access denied");
    }

    const { error } = await supabase
      .from("radicals")
      .delete()
      .match({ id, user_id: user.id });

    if (error) {
      throw new Error(error.message || "Failed to delete radical");
    }

    revalidatePath("/radicals");
    revalidatePath("/dashboard/radicals");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete radical:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
