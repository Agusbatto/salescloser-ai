import { signInAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { appConfig } from "@/config/app";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-gray-200 bg-white p-8">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">{appConfig.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Iniciá sesión para continuar</p>
        </div>
        <AuthForm
          action={signInAction}
          submitLabel="Iniciar sesión"
          pendingLabel="Ingresando..."
          footer={{ text: "¿No tenés cuenta?", linkLabel: "Registrate", href: "/register" }}
        />
      </div>
    </div>
  );
}
