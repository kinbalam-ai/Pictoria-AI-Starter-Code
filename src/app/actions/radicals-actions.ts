/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/saveRadical.ts
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

export async function saveRadicals(
  data: RadicalInput[]
): Promise<RadicalResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  console.log("Authenticated user ID:", user?.id);
  console.log("JWT exists:", !!supabase.auth.getSession());
  console.log("Session valid:", await supabase.auth.getSession());

  if (authError || !user) {
    return {
      error: "Unauthorized - You must be logged in to save radicals",
      success: false,
      data: null,
    };
  }

  try {
    // PROPERLY format the insert data
    const insertPayload = data.map((radical) => ({
      forms: radical.forms, // Already an array - don't stringify!
      pinyin: radical.pinyin, // Already an array - don't stringify!
      kangxi_number: radical.kangxi_number,
      name_en: radical.name_en,
      meaning: radical.meaning,
      hsk_level: radical.hsk_level,
      user_id: user.id, // Must match auth.uid()
      // created_at: new Date(), // Let Supabase handle conversion
    }));
    console.log("Insert payload:", JSON.stringify(insertPayload, null, 2));

    // Insert all radicals in a single transaction
    const { data: dbData, error: dbError } = await supabase
      .from("radicals")
      .insert(insertPayload)
      .select();

    if (dbError) {
      console.error("Supabase error:", dbError);
      throw dbError;
    }

    // Revalidate paths
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

export async function getRadicals(limit?: number) {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["radicals"], // Customize cache tags as needed
    },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  let query = supabase
    .from("radicals")
    .select(`
      id,
      created_at,
      forms,
      pinyin,
      kangxi_number,
      name_en,
      meaning,
      hsk_level
    `)
    .eq("user_id", user.id)
    .order("kangxi_number", { ascending: true }); // Ordered by Kangxi number

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      error: error.message || "Failed to fetch radicals",
      success: false,
      data: null,
    };
  }

  // Format the data for easier consumption
  const formattedRadicals = data.map((radical) => ({
    ...radical,
    // Add any additional formatting here
    primary_form: radical.forms[0]?.variant || "",
    primary_pinyin: radical.pinyin[0]?.pronunciation || "",
  }));

  return {
    error: null,
    success: true,
    data: formattedRadicals || null,
  };
}

export async function deleteRadical(id: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete radical - not authenticated",
      data: null
    };
  }

  try {
    // First delete from database
    console.log("deleteRadical...")
    const { error: deleteError, data } = await supabase
      .from("radicals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user can only delete their own radicals
      .select();

    if (deleteError) {
      return {
        error: deleteError.message,
        success: false,
        message: "Database deletion failed",
        data: null
      };
    }

    // Revalidate cached data
    revalidatePath("/radicals");
    revalidatePath("/dashboard/radicals");

    return {
      error: null,
      success: true,
      message: "Radical deleted successfully",
      data: data[0] // Return the deleted radical
    };

  } catch (error) {
    console.error("Failed to delete radical:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
      message: "Failed to delete radical",
      data: null
    };
  }
}