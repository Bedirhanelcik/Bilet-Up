import { Suspense } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
