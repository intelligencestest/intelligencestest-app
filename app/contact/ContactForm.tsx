"use client";

import { useState } from "react";
import type { PublicCopy } from "@/lib/public-site-copy";

type FormKind = "contact" | "demo";
type ContactFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  companyType: string;
  employees: string;
  message: string;
  website: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  phone: "",
  companyType: "",
  employees: "",
  message: "",
  website: "",
};

export default function ContactForm({ copy, kind, locale }: { copy: PublicCopy; kind: FormKind; locale: "en" | "es" }) {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isDemo = kind === "demo";
  const formCopy = copy.contact.form;

  function update(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind, locale }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || formCopy.error);
      }

      setStatus("success");
      setForm(initialState);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : formCopy.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-[#2a2824] bg-[#1d1c19] p-5 sm:p-6">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">{formCopy.website}</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{formCopy.name}</span>
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{formCopy.email}</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{formCopy.company}</span>
          <input
            required
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{formCopy.role}</span>
          <input
            value={form.role}
            onChange={(event) => update("role", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{formCopy.companyType}</span>
          <select
            value={form.companyType}
            onChange={(event) => update("companyType", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          >
            <option value="">-</option>
            {formCopy.typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">{isDemo ? formCopy.employees : formCopy.phone}</span>
          <input
            value={isDemo ? form.employees : form.phone}
            onChange={(event) => update(isDemo ? "employees" : "phone", event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-200">{formCopy.message}</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className="mt-2 w-full resize-y rounded-lg border border-[#2a2824] bg-[#171614] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#50618f] focus:ring-2 focus:ring-[#50618f]/25"
        />
      </label>

      {status === "success" && (
        <p className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">
          {isDemo ? formCopy.successDemo : formCopy.successContact}
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error || formCopy.error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#50618f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46557e] focus:outline-none focus:ring-2 focus:ring-[#a6b2cf]/70 disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? formCopy.sending : isDemo ? formCopy.submitDemo : formCopy.submitContact}
      </button>
    </form>
  );
}
