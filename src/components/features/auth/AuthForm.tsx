"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { AuthActionResult } from "@/app/(auth)/actions";

interface AuthFormProps {
  action: (prev: AuthActionResult | null, formData: FormData) => Promise<AuthActionResult>;
  submitLabel: string;
  pendingLabel: string;
  footer: { text: string; linkLabel: string; href: string };
}

export function AuthForm({ action, submitLabel, pendingLabel, footer }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.message && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.message}</p>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? pendingLabel : submitLabel}
      </Button>

      <p className="text-center text-sm text-gray-500">
        {footer.text}{" "}
        <Link href={footer.href} className="font-medium text-gray-900 hover:underline">
          {footer.linkLabel}
        </Link>
      </p>
    </form>
  );
}
