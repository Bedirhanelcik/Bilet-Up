import { AuthCard } from "@/components/layout/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  );
}
