export type PresetKey =
  | "odx_config"
  | "companies_all"
  | "companies_by_name"
  | "companies_by_id"
  | "partners_by_id"
  | "partners_by_email"
  | "partners_by_name"
  | "create_partner_name_only";

export type Preset = {
  key: PresetKey;
  label: string;
  tool: string;
  buildArgs: (voiceText: string) => Record<string, unknown>;
  hint?: string;
};

export const PRESETS: Preset[] = [
  {
    key: "odx_config",
    label: "Show ODX Config",
    tool: "odx_config",
    buildArgs: () => ({}),
  },
  {
    key: "companies_all",
    label: "Get Companies (all)",
    tool: "get_companies",
    buildArgs: () => ({}),
    hint: "Returns all companies (no filter)",
  },
  {
    key: "companies_by_name",
    label: "Get Companies by Name",
    tool: "get_companies",
    buildArgs: (s) => ({ name: s.trim() }),
  },
  {
    key: "companies_by_id",
    label: "Get Company by ID",
    tool: "get_companies",
    buildArgs: (s) => ({ id: Number.parseInt(s.trim(), 10) || undefined }),
    hint: "Numeric ID",
  },
  {
    key: "partners_by_id",
    label: "Get Partner by ID",
    tool: "get_partners",
    buildArgs: (s) => ({ id: Number.parseInt(s.trim(), 10) || undefined }),
    hint: "Numeric ID",
  },
  {
    key: "partners_by_email",
    label: "Get Partner by Email",
    tool: "get_partners",
    buildArgs: (s) => ({ email: s.trim().toLowerCase() }),
    hint: "Must contain @",
  },
  {
    key: "partners_by_name",
    label: "Get Partners by Name (ilike)",
    tool: "get_partners",
    buildArgs: (s) => ({ name: s.trim() }),
  },
  {
    key: "create_partner_name_only",
    label: "Create Partner (name only)",
    tool: "create_partner",
    buildArgs: (s) => ({ name: s.trim() }),
  },
];
