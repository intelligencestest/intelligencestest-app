import Link from "next/link";
import { getLocale } from "next-intl/server";
import { UserPlus } from "lucide-react";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { getPlanUsageSummary } from "@/lib/plan/limits";
import { localePath, toAppLocale } from "@/lib/i18n/locales";

type MemberRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  created_at: string;
};

/**
 * Team settings: the real member list (users.role has existed since the
 * first schema), the plan's recruiter limit, and an honest invite path —
 * during launch, new recruiter seats are provisioned by support, so the
 * invite affordance opens a disclosure that says exactly that. No fake
 * pending rows, no fake role editing.
 */
export default async function TeamSettingsPage() {
  const locale = toAppLocale(await getLocale());
  const es = locale === "es";

  const copy = es
    ? {
        title: "Equipo",
        description: "Miembros del espacio de trabajo, roles y acceso.",
        member: "Miembro",
        role: "Rol",
        status: "Estado",
        joined: "Alta",
        you: "Tú",
        active: "Activo",
        roleAdmin: "Admin",
        roleRecruiter: "Recruiter",
        seats: (used: number, limit: string) => `${used} de ${limit} recruiters en su plan`,
        unlimited: "sin límite",
        invite: "Invitar recruiter",
        atLimitTitle: "Ha alcanzado el límite de recruiters de su plan.",
        atLimitBody: "Amplíe su plan para añadir más miembros al equipo.",
        atLimitCta: "Ver planes",
        inviteTitle: "Alta de un nuevo recruiter",
        inviteBody:
          "Durante el lanzamiento, las altas de recruiters las gestiona nuestro equipo: envíenos el nombre y el correo del nuevo miembro y lo activaremos en su workspace en menos de 24 horas laborables.",
        inviteCta: "Contactar con soporte",
        soloNote: "Por ahora solo usted forma parte del equipo.",
        soloHint: "Los planes Professional y Enterprise permiten trabajar con más recruiters en el mismo workspace.",
      }
    : {
        title: "Team",
        description: "Workspace members, roles, and access.",
        member: "Member",
        role: "Role",
        status: "Status",
        joined: "Joined",
        you: "You",
        active: "Active",
        roleAdmin: "Admin",
        roleRecruiter: "Recruiter",
        seats: (used: number, limit: string) => `${used} of ${limit} recruiters on your plan`,
        unlimited: "unlimited",
        invite: "Invite recruiter",
        atLimitTitle: "You have reached your plan's recruiter limit.",
        atLimitBody: "Upgrade your plan to add more team members.",
        atLimitCta: "View plans",
        inviteTitle: "Adding a new recruiter",
        inviteBody:
          "During launch, recruiter seats are provisioned by our team: send us the new member's name and email and we will activate them in your workspace within one business day.",
        inviteCta: "Contact support",
        soloNote: "For now, you are the only member of this team.",
        soloHint: "Professional and Enterprise plans support additional recruiters in the same workspace.",
      };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user!.id)
    .single();

  const [{ data: members }, planSummary] = await Promise.all([
    admin
      .from("users")
      .select("id, full_name, email, role, created_at")
      .eq("company_id", profile!.company_id)
      .order("created_at", { ascending: true })
      .returns<MemberRow[]>(),
    getPlanUsageSummary(admin, profile!.company_id),
  ]);

  const team = members ?? [];
  const recruiterLimit = planSummary?.limits.recruiters ?? null;
  const atLimit = recruiterLimit !== null && team.length >= recruiterLimit;
  const dateLocale = es ? "es-ES" : "en-US";

  const initialsOf = (name: string | null, email: string) => {
    const source = name?.trim() || email;
    return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--it-muted)]">
            {copy.description}
            <span className="mx-2 text-[var(--it-faint)]">·</span>
            <span className="tabular-nums text-[var(--it-faint)]">
              {copy.seats(team.length, recruiterLimit === null ? copy.unlimited : String(recruiterLimit))}
            </span>
          </p>
        </div>

        {!atLimit && (
          <details className="group relative self-start sm:self-auto">
            <summary className="enterprise-button inline-flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {copy.invite}
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-[var(--it-hairline)] bg-white p-5 shadow-[0_4px_16px_rgba(16,24,40,0.1)]">
              <p className="text-sm font-semibold text-[var(--it-text)]">{copy.inviteTitle}</p>
              <p className="mt-2 text-[13px] leading-6 text-[var(--it-muted)]">{copy.inviteBody}</p>
              <Link
                href={localePath("/contact", locale)}
                className="enterprise-button mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-[13px] font-semibold"
              >
                {copy.inviteCta}
              </Link>
            </div>
          </details>
        )}
      </div>

      {atLimit && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.06)] px-4 py-3">
          <p className="text-sm text-[#92400e]">
            <span className="font-semibold">{copy.atLimitTitle}</span> {copy.atLimitBody}
          </p>
          <Link
            href={localePath("/settings/billing", locale)}
            className="text-sm font-semibold text-[var(--it-link)] hover:underline"
          >
            {copy.atLimitCta} →
          </Link>
        </div>
      )}

      {/* Member table */}
      <div className="enterprise-card mt-8 overflow-hidden rounded-xl">
        <div className="hidden grid-cols-12 gap-4 border-b enterprise-divider px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)] md:grid">
          <div className="col-span-6">{copy.member}</div>
          <div className="col-span-2">{copy.role}</div>
          <div className="col-span-2">{copy.status}</div>
          <div className="col-span-2 text-right">{copy.joined}</div>
        </div>
        <div className="divide-y divide-[var(--it-hairline)]">
          {team.map((member) => {
            const isSelf = member.id === user!.id;
            const isAdmin = (member.role ?? "admin") === "admin";
            return (
              <div key={member.id} className="grid gap-x-4 gap-y-1 px-4 py-4 md:grid-cols-12 md:items-center md:px-6">
                <div className="flex min-w-0 items-center gap-3 md:col-span-6">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] text-[11px] font-semibold text-slate-200">
                    {initialsOf(member.full_name, member.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--it-text)]">
                      {member.full_name?.trim() || member.email}
                      {isSelf && (
                        <span className="ml-2 rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--it-link)]">
                          {copy.you}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-[var(--it-muted)]">{member.email}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[13px] text-slate-300">{isAdmin ? copy.roleAdmin : copy.roleRecruiter}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="inline-flex items-center gap-2 text-[13px] text-slate-300">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16a34a]" aria-hidden="true" />
                    {copy.active}
                  </span>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <span className="text-[13px] tabular-nums text-[var(--it-muted)]">
                    {new Date(member.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {team.length === 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-200">{copy.soloNote}</p>
          <p className="mt-1 text-[13px] text-[var(--it-muted)]">{copy.soloHint}</p>
        </div>
      )}
    </div>
  );
}
