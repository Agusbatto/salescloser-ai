"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function signInAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { success: false, error: "Completá email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: "Email o contraseña incorrectos." };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { success: false, error: "Completá email y contraseña." };
  }
  if (password.length < 6) {
    return { success: false, error: "La contraseña tiene que tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  // Si el proyecto de Supabase tiene "Confirm email" activado, todavía
  // no hay sesión acá — hay que confirmar por correo antes de entrar.
  if (!data.session) {
    return {
      success: true,
      message: "Cuenta creada. Revisá tu correo para confirmarla antes de iniciar sesión.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
