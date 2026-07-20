import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/types/client";
import type { TagInput } from "@/lib/validations/client";

export async function listTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .order("name", { ascending: true });

  if (error) throw new Error(`No se pudieron obtener las etiquetas: ${error.message}`);
  return data as Tag[];
}

export async function createTag(input: TagInput): Promise<Tag> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: input.name, color: input.color, owner_id: userData.user.id })
    .select("id, name, color")
    .single();

  if (error) throw new Error(`No se pudo crear la etiqueta: ${error.message}`);
  return data as Tag;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar la etiqueta: ${error.message}`);
}
