import type { createAdminClient } from "@/lib/supabase-server";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Console search — structured-query architecture.
 *
 * Everything downstream (the executor, the palette, the API) consumes a
 * StructuredQuery, never raw text. Today parseQuery only detects tokens and
 * URLs (the link decoder) and passes text through; a future natural-language
 * layer replaces parseQuery's internals — mapping "companies inactive for a
 * month" onto entityTypes + filters — while the executor and UI stay as-is.
 */
export interface StructuredQuery {
  text: string;
  /** Restrict to these entity types; undefined = all. */
  entityTypes?: SearchEntityType[];
  /** Exact invite token extracted from pasted text or URL, if any. */
  inviteToken?: string;
  /** Reserved for the NL layer: parsed filters like status or inactivity. */
  filters?: Record<string, string>;
}

export type SearchEntityType = "company" | "recruiter" | "candidate" | "project";

export interface SearchHit {
  type: SearchEntityType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

type SingleRelation<T> = T | T[] | null;

function firstRelation<T>(value: SingleRelation<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseQuery(raw: string): StructuredQuery {
  const text = raw.trim();

  // Link decoder: support tickets quote invite URLs or bare tokens.
  const tokenParam = text.match(/[?&]token=([0-9a-f-]{36})/i)?.[1];
  const bareUuid = !tokenParam && !text.includes("/") ? text.match(UUID_RE)?.[0] : undefined;

  return {
    text,
    inviteToken: tokenParam ?? bareUuid ?? undefined,
  };
}

function escapeLike(value: string) {
  return value.replace(/[%_\\]/g, (c) => `\\${c}`);
}

const PER_TYPE_LIMIT = 5;

export async function searchEntities(
  admin: AdminClient,
  query: StructuredQuery
): Promise<SearchHit[]> {
  const hits: SearchHit[] = [];
  const wants = (t: SearchEntityType) => !query.entityTypes || query.entityTypes.includes(t);

  // Token lookup first: an exact invite-token hit is the answer, not a result.
  if (query.inviteToken) {
    const { data } = await admin
      .from("candidates")
      .select("id, full_name, email, token, hiring_projects(name)")
      .eq("token", query.inviteToken)
      .maybeSingle();
    if (data) {
      return [
        {
          type: "candidate",
          id: data.id,
          title: data.full_name || data.email || "Candidate",
          subtitle: `Invite token match · ${
            firstRelation((data as { hiring_projects: SingleRelation<{ name: string }> }).hiring_projects)?.name ?? ""
          }`,
          href: `/admin/candidates/${data.id}`,
        },
      ];
    }
  }

  if (query.text.length < 2) return hits;
  const like = `%${escapeLike(query.text)}%`;

  const [companies, recruiters, candidates, projects] = await Promise.all([
    wants("company")
      ? admin
          .from("companies")
          .select("id, name, email, plan, status")
          .or(`name.ilike.${like},email.ilike.${like}`)
          .limit(PER_TYPE_LIMIT)
      : { data: null },
    wants("recruiter")
      ? admin
          .from("users")
          .select("id, full_name, email, company_id, companies(id, name)")
          .or(`full_name.ilike.${like},email.ilike.${like}`)
          .limit(PER_TYPE_LIMIT)
      : { data: null },
    wants("candidate")
      ? admin
          .from("candidates")
          .select("id, full_name, email, company_id, hiring_projects(name)")
          .or(`full_name.ilike.${like},email.ilike.${like}`)
          .limit(PER_TYPE_LIMIT)
      : { data: null },
    wants("project")
      ? admin
          .from("hiring_projects")
          .select("id, name, status, company_id, companies(id, name)")
          .ilike("name", like)
          .limit(PER_TYPE_LIMIT)
      : { data: null },
  ]);

  for (const c of companies.data ?? []) {
    hits.push({
      type: "company",
      id: c.id,
      title: c.name,
      subtitle: `${c.email} · ${c.plan} · ${c.status}`,
      href: `/admin/companies/${c.id}`,
    });
  }
  for (const u of recruiters.data ?? []) {
    const company = firstRelation((u as { companies: SingleRelation<{ id: string; name: string }> }).companies);
    hits.push({
      type: "recruiter",
      id: u.id,
      title: u.full_name || u.email,
      subtitle: `${u.email}${company ? ` · ${company.name}` : ""}`,
      href: company ? `/admin/companies/${company.id}` : "/admin/companies",
    });
  }
  for (const c of candidates.data ?? []) {
    const project = firstRelation((c as { hiring_projects: SingleRelation<{ name: string }> }).hiring_projects);
    hits.push({
      type: "candidate",
      id: c.id,
      title: c.full_name || c.email || "Candidate",
      subtitle: `${c.email ?? ""}${project ? ` · ${project.name}` : ""}`,
      href: `/admin/candidates/${c.id}`,
    });
  }
  for (const p of projects.data ?? []) {
    const company = firstRelation((p as { companies: SingleRelation<{ id: string; name: string }> }).companies);
    hits.push({
      type: "project",
      id: p.id,
      title: p.name,
      subtitle: `${p.status}${company ? ` · ${company.name}` : ""}`,
      href: p.company_id ? `/admin/companies/${p.company_id}` : "/admin/companies",
    });
  }

  return hits;
}
