"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import { createLoginSchema, type LoginValues } from "@/features/auth/schemas";
import { useLoginMutation, useLoginWithGoogleMutation } from "@/features/auth/authApi";
import { getAuthErrorMessage } from "@/lib/firebase/errors";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ApiError } from "@/redux/api/apiSlice";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const redirectTo = searchParams.get("redirect") || "/discover";
  const [formError, setFormError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] = useLoginWithGoogleMutation();

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values).unwrap();
      router.push(redirectTo);
    } catch (error) {
      setFormError(getAuthErrorMessage((error as ApiError).code, t));
    }
  }

  async function handleGoogle() {
    setFormError(null);
    try {
      await loginWithGoogle().unwrap();
      router.push(redirectTo);
    } catch (error) {
      setFormError(getAuthErrorMessage((error as ApiError).code, t));
    }
  }

  const isBusy = isLoggingIn || isGoogleLoading;

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-1 text-center">
        <h1 className="font-heading text-xl font-semibold">{t("auth.welcomeBack")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.signInSubtitle")}</p>
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
          <Label htmlFor="login-email">{t("auth.email")}</Label>
          <Input id="login-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">{t("auth.password")}</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isBusy} className="mt-1">
          {isLoggingIn && <Loader2 className="size-4 animate-spin" />}
          {t("auth.signInBtn")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("auth.signUp")}
        </Link>
      </p>
    </div>
  );
}
