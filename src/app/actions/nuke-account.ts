"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function nukeAccountAction(profileId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        error: "Supabase Admin environment variables are missing.",
      };
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profileId,
      )
    ) {
      return { success: false, error: "Invalid profile ID." };
    }

    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfileError || currentProfile?.role !== "admin") {
      return { success: false, error: "Permission denied." };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: target, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", profileId)
      .maybeSingle();

    if (targetError) {
      console.error("Profile lookup failed:", targetError);
      return {
        success: false,
        error: "Failed to access the profile. Check your service_role key.",
      };
    }

    if (!target) {
      return { success: false, error: "Profile not found." };
    }

    if (target.role === "admin") {
      return {
        success: false,
        error: "Administrator accounts cannot be deleted.",
      };
    }

    const { data: booker, error: bookerError } = await supabaseAdmin
      .from("bookers")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (bookerError) {
      console.error("Booker lookup failed:", bookerError);
      return { success: false, error: "Failed to find the booker." };
    }

    if (booker) {
      const { error: reservationsError } = await supabaseAdmin
        .from("reservations")
        .delete()
        .eq("booker_id", booker.id);

      if (reservationsError) {
        console.error("Reservation deletion failed:", reservationsError);
        return {
          success: false,
          error: "Failed to delete reservations.",
        };
      }

      const { error: bookerDeleteError } = await supabaseAdmin
        .from("bookers")
        .delete()
        .eq("id", booker.id);

      if (bookerDeleteError) {
        console.error("Booker deletion failed:", bookerDeleteError);
        return { success: false, error: "Failed to delete booker." };
      }
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (profileDeleteError) {
      console.error("Profile deletion failed:", profileDeleteError);
      return { success: false, error: "Failed to delete profile." };
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(profileId);

    if (authDeleteError) {
      console.error("Auth deletion failed:", authDeleteError);
      return {
        success: false,
        error:
          "Profile deleted, but Auth deletion failed. Manual recovery is required.",
      };
    }

    revalidatePath("/bookers");

    return { success: true };
  } catch (error) {
    console.error("Account deletion failed:", error);

    return {
      success: false,
      error: "An unexpected error occurred while deleting the account.",
    };
  }
}
