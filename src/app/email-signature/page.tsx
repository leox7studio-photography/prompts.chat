import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EmailSignatureBuilder } from "@/components/email-signature/email-signature-builder";

export const metadata: Metadata = {
  title: "Zoho Mail Signature Designer",
  description: "Create a polished JW Tech email signature for Zoho Mail.",
};

export default async function EmailSignaturePage() {
  const t = await getTranslations("emailSignature");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f6f6f3] dark:bg-[#0d0d0d]">
      <section className="border-b border-black/10 bg-[#171717] text-white dark:border-white/10">
        <div className="container py-12 sm:py-16">
          <div className="flex max-w-3xl items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff6714]">
            <span className="h-px w-8 bg-[#ff6714]" />
            {t("eyebrow")}
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            {t("description")}
          </p>
        </div>
      </section>
      <EmailSignatureBuilder />
    </div>
  );
}
