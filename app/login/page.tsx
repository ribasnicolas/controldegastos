import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Control de Gastos</h1>
          <p className="text-sm text-gray-500">Iniciá sesión para ver tus gastos</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
