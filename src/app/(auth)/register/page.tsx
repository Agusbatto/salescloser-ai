import { signUpAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { appConfig } from "@/config/app";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-gray-200 bg-white p-8">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">{appConfig.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Creá tu cuenta</p>
        </div>
        <AuthForm
          action={signUpAction}
          submitLabel="Crear cuenta"
          pendingLabel="Creando..."
          footer={{ text: "¿Ya tenés cuenta?", linkLabel: "Iniciar sesión", href: "/login" }}
        />
      </div>
    </div>
  );
}
