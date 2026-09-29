"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Mail, MapPin, Phone, RotateCcw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignatureDetails {
  name: string;
  role: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

const DEFAULT_DETAILS: SignatureDetails = {
  name: "Your Name",
  role: "Technical Services Specialist",
  phone: "+971 50 000 0000",
  email: "hello@jwtech.ae",
  website: "www.jwtech.ae",
  address: "Dubai, United Arab Emirates",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return "#";
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
}

function buildSignatureHtml(details: SignatureDetails, logoUrl: string): string {
  const safe = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, escapeHtml(value.trim())]),
  ) as unknown as SignatureDetails;
  const websiteUrl = escapeHtml(normalizeUrl(details.website));
  const phoneUrl = escapeHtml(details.phone.replace(/[^+\d]/g, ""));

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;font-family:Arial,Helvetica,sans-serif;color:#181818;border-collapse:collapse">
  <tr>
    <td style="width:176px;padding:0 24px 0 0;vertical-align:middle;border-right:3px solid #ff6714">
      <img src="${escapeHtml(logoUrl)}" width="176" alt="JW Tech" style="display:block;width:176px;max-width:100%;height:auto;border:0">
    </td>
    <td style="padding:2px 0 2px 24px;vertical-align:middle">
      <div style="margin:0;color:#171717;font-size:22px;line-height:28px;font-weight:700;letter-spacing:.2px">${safe.name}</div>
      <div style="margin:2px 0 14px;color:#f05a0b;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px">${safe.role}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#4b4b4b;border-collapse:collapse">
        <tr><td style="padding:0 8px 2px 0;color:#f05a0b;font-weight:bold">T</td><td style="padding:0 0 2px"><a href="tel:${phoneUrl}" style="color:#4b4b4b;text-decoration:none">${safe.phone}</a></td></tr>
        <tr><td style="padding:0 8px 2px 0;color:#f05a0b;font-weight:bold">E</td><td style="padding:0 0 2px"><a href="mailto:${safe.email}" style="color:#4b4b4b;text-decoration:none">${safe.email}</a></td></tr>
        <tr><td style="padding:0 8px 2px 0;color:#f05a0b;font-weight:bold">W</td><td style="padding:0 0 2px"><a href="${websiteUrl}" style="color:#4b4b4b;text-decoration:none">${safe.website}</a></td></tr>
        <tr><td style="padding:0 8px 0 0;color:#f05a0b;font-weight:bold">A</td><td>${safe.address}</td></tr>
      </table>
    </td>
  </tr>
  <tr><td colspan="2" style="padding-top:14px"><div style="height:1px;background:#ddddda;line-height:1px">&nbsp;</div><div style="padding-top:8px;color:#8a8a86;font-size:9px;line-height:14px">JW TECH &nbsp;•&nbsp; JAW TECHNICALS TECHNICAL SERVICES LLC</div></td></tr>
</table>`;
}

export function EmailSignatureBuilder() {
  const t = useTranslations("emailSignature");
  const [details, setDetails] = useState<SignatureDetails>(DEFAULT_DETAILS);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const signatureHtml = useMemo(() => buildSignatureHtml(details, "/jw-tech-logo.svg"), [details]);

  function updateField(field: keyof SignatureDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    setCopied(false);
  }

  async function copySignature() {
    const portableSignatureHtml = buildSignatureHtml(details, `${window.location.origin}/jw-tech-logo.svg`);
    try {
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([portableSignatureHtml], { type: "text/html" }),
        "text/plain": new Blob([previewRef.current?.innerText ?? ""], { type: "text/plain" }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      if (previewRef.current && selection) {
        range.selectNodeContents(previewRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        selection.removeAllRanges();
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  const fields: Array<{ key: keyof SignatureDetails; icon: typeof UserRound; type?: string }> = [
    { key: "name", icon: UserRound },
    { key: "role", icon: UserRound },
    { key: "phone", icon: Phone, type: "tel" },
    { key: "email", icon: Mail, type: "email" },
    { key: "website", icon: Mail, type: "url" },
    { key: "address", icon: MapPin },
  ];

  return (
    <section className="container py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f05a0b]">{t("detailsEyebrow")}</p>
              <h2 className="mt-2 text-xl font-semibold">{t("detailsTitle")}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDetails(DEFAULT_DETAILS)} aria-label={t("reset")} title={t("reset")}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            {fields.map(({ key, icon: Icon, type }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`signature-${key}`} className="text-xs font-semibold text-muted-foreground">
                  {t(`fields.${key}`)}
                </Label>
                <div className="relative">
                  <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id={`signature-${key}`} type={type} value={details[key]} onChange={(event) => updateField(key, event.target.value)} className="h-11 pl-10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#171717]">
          <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f05a0b]">{t("previewEyebrow")}</p>
              <h2 className="mt-1 text-xl font-semibold">{t("previewTitle")}</h2>
            </div>
            <Button onClick={copySignature} className="gap-2 bg-[#171717] text-white hover:bg-[#f05a0b] dark:bg-[#f05a0b] dark:hover:bg-[#d94d00]">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>
          <div className="bg-[radial-gradient(circle_at_top_left,#ffffff_0,#f3f3ef_100%)] p-5 sm:p-8 lg:p-12">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("desktopPreview")}
            </div>
            <div className="overflow-x-auto rounded-xl border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10">
              <div ref={previewRef} className="min-w-[540px]" dangerouslySetInnerHTML={{ __html: signatureHtml }} />
            </div>
          </div>
          <div className="border-t border-black/10 bg-[#fafaf8] px-5 py-5 dark:border-white/10 dark:bg-[#121212] sm:px-7">
            <h3 className="text-sm font-semibold">{t("howToTitle")}</h3>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-3 sm:gap-5">
              <li><span className="mr-2 font-bold text-[#f05a0b]">01</span>{t("steps.copy")}</li>
              <li><span className="mr-2 font-bold text-[#f05a0b]">02</span>{t("steps.open")}</li>
              <li><span className="mr-2 font-bold text-[#f05a0b]">03</span>{t("steps.paste")}</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
