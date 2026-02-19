import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Please enter the admin password to continue.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
