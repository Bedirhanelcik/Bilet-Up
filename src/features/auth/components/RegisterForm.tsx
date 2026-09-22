"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import { createRegisterSchema, type RegisterValues } from "@/features/auth/schemas";
import { useRegisterMutation, useLoginWithGoogleMutation } from "@/features/auth/authApi";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ApiError } from "@/redux/api/apiSlice";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);

  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] = useLoginWithGoogleMutation();

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      await registerUser(values).unwrap();
      router.push("/onboarding");
    } catch (error) {
      setFormError(getAuthErrorMessage((error as ApiError).code, t));
    }
  }

  async function handleGoogle() {
    setFormError(null);
    try {
      await loginWithGoogle().unwrap();
      router.push("/onboarding");
    } catch (error) {
      setFormError(getAuthErrorMessage((error as ApiError).code, t));
    }
  }

  const isBusy = isRegistering || isGoogleLoading;

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-1 text-center">
        <h1 className="font-heading text-xl font-semibold">{t("auth.createAccount")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.registerSubtitle")}</p>
      </div>

      <Button variant="outline" onClick={handleGoogle} disabled={isBusy} className="w-full">
        {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
        {t("auth.continueWithGoogle")}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        {t("auth.or")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name">{t("auth.fullName")}</Label>
          <Input id="register-name" autoComplete="name" aria-invalid={!!errors.displayName} {...register("displayName")} />
          {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email">{t("auth.email")}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password">{t("auth.password")}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isBusy} className="mt-1">
          {isRegistering && <Loader2 className="size-4 animate-spin" />}
          {t("auth.createAccountBtn")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.signInBtn")}
        </Link>
      </p>
    </div>
  );
}
