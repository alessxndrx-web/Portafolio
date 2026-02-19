"use client";

import { useState } from "react";
import { z } from "zod";
import { useTranslation } from "@/lib/useTranslation";
import { useToast } from "@/components/ui/toast";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Section } from "@/components/design";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ContactMessage } from "@/types";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export default function ContactPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>("contact_messages", []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = contactSchema.parse(formData);
      const message: ContactMessage = {
        id: Math.random().toString(36).slice(2, 9),
        ...validated,
        date: new Date().toISOString(),
      };

      setMessages([message, ...messages].slice(0, 5));
      setFormData({ name: "", email: "", message: "" });
      showToast(t.contact.success, "success");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((issue) => {
          if (!issue.path[0]) {
            return;
          }
          const field = issue.path[0] as string;
          if (field === "name") {
            fieldErrors.name = t.contact.nameRequired;
          }
          if (field === "email") {
            fieldErrors.email = issue.message.includes("email") ? t.contact.emailInvalid : t.contact.emailRequired;
          }
          if (field === "message") {
            fieldErrors.message = t.contact.messageRequired;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section title={t.contact.title} subtitle={t.contact.subtitle} className="pt-12">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-2xl border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{t.contact.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="field-label">
                  {t.contact.name}
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  {t.contact.email}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="message" className="field-label">
                  {t.contact.message}
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  className={`ui-textarea ${
                    errors.message ? "border-destructive" : ""
                  }`}
                />
                {errors.message ? <p className="mt-1 text-xs text-destructive">{errors.message}</p> : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t.contact.sending : t.contact.send}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
