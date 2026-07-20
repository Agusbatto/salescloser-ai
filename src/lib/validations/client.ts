import { z } from "zod";

/**
 * Validación de entrada para crear/editar un cliente. Se usa tanto en
 * los Server Actions como en el formulario del cliente.
 */
export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  company: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal(""))
    .nullable(),
  productInterest: z.string().trim().optional().nullable(),
  leadOrigin: z.string().trim().optional().nullable(),
  status: z.string().trim().min(1),
  notes: z.string().trim().optional().nullable(),
  conversation: z.string().trim().optional().nullable(),
  lastContactAt: z.string().optional().nullable(),
});

export type ClientInput = z.infer<typeof clientInputSchema>;

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la etiqueta es obligatorio"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
});

export type TagInput = z.infer<typeof tagInputSchema>;
