"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useTranslation } from "@/lib/useTranslation";
import { useAuth } from "@/lib/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoginError("");
    setIsSubmitting(true);

    try {
      const validated = loginSchema.parse(formData);
      const success = login(validated.email, validated.password);
      if (!success) {
        setLoginError(t.login.invalidCredentials);
        return;
      }

      router.push("/projects");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((issue) => {
          if (!issue.path[0]) {
            return;
          }
          const field = issue.path[0] as string;
          if (field === "email") {
            fieldErrors.email = t.login.emailRequired;
          }
          if (field === "password") {
            fieldErrors.password = t.login.passwordRequired;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl items-center justify-center px-4 py-12 md:px-6">
      <Card className="w-full max-w-md rounded-2xl border-border/70 bg-card/86">
        <CardHeader>
          <CardTitle className="text-2xl">{t.login.title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">{t.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="field-label">
                {t.login.email}
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className={errors.email ? "border-destructive" : ""}
                data-testid="login-email"
              />
              {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                {t.login.password}
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                className={errors.password ? "border-destructive" : ""}
                data-testid="login-password"
              />
              {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password}</p> : null}
            </div>

            {loginError ? <p className="text-xs text-destructive">{loginError}</p> : null}

            <div className="rounded-xl border border-border/70 bg-secondary/35 p-3 text-xs text-muted-foreground">
              <p className="font-semibold uppercase tracking-wide text-foreground">{t.login.demoCredentials}</p>
              <p>{t.login.email}: demo@site.com</p>
              <p>{t.login.password}: demo1234</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="login-submit">
              {isSubmitting ? t.login.loggingIn : t.login.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
