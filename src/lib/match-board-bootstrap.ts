import type { FieldType } from "@/components/board/TacticalField";

export type MatchBoardSource = "elite" | "sandbox";

export const MATCH_BOARD_SOURCE_KEY = "synq_match_board_source";

export function parseMatchBoardSource(v: string | null): MatchBoardSource | null {
  if (v === "elite" || v === "sandbox") return v;
  return null;
}

export function resolveMatchBoardSource(
  querySource: string | null,
  stored: string | null,
): MatchBoardSource {
  return parseMatchBoardSource(querySource) ?? parseMatchBoardSource(stored) ?? "elite";
}

interface PromoTeamLocal {
  type?: string;
  starters?: string[];
}

interface ProPlayerRow {
  name?: string;
  surname?: string;
  nickname?: string;
  number?: string | number;
}

const VALID_FIELD: FieldType[] = ["f11", "f7", "futsal"];

function normalizeFieldType(v: string | undefined | null): FieldType | null {
  if (!v) return null;
  return VALID_FIELD.includes(v as FieldType) ? (v as FieldType) : null;
}

/**
 * Carga nombres del equipo local y tipo de campo sugerido.
 * - sandbox: `synq_promo_team` (MI EQUIPO promo).
 * - elite: plantilla Pro `synq_players` (dorsal numérico, ordenados).
 */
export function loadLocalLineupForMatchBoard(source: MatchBoardSource): {
  names: string[];
  fieldType: FieldType | null;
} {
  if (typeof window === "undefined") return { names: [], fieldType: null };

  if (source === "sandbox") {
    const raw = localStorage.getItem("synq_promo_team");
    if (!raw) return { names: [], fieldType: null };
    try {
      const t = JSON.parse(raw) as PromoTeamLocal;
      const starters = (t.starters || []).map((s) => String(s || "").trim()).filter(Boolean);
      return {
        names: starters.map((s) => s.toUpperCase()),
        fieldType: normalizeFieldType(t.type),
      };
    } catch {
      return { names: [], fieldType: null };
    }
  }

  const raw = localStorage.getItem("synq_players");
  if (!raw) return { names: [], fieldType: null };
  try {
    const players = JSON.parse(raw) as ProPlayerRow[];
    if (!Array.isArray(players)) return { names: [], fieldType: null };
    const sorted = [...players].filter((p) => p && (p.name || p.number !== undefined));
    sorted.sort((a, b) => {
      const na = typeof a.number === "string" ? parseInt(a.number, 10) : Number(a.number ?? 0);
      const nb = typeof b.number === "string" ? parseInt(b.number, 10) : Number(b.number ?? 0);
      return (Number.isFinite(na) ? na : 999) - (Number.isFinite(nb) ? nb : 999);
    });
    const names = sorted.slice(0, 22).map((p) => {
      const nick = (p.nickname || "").trim();
      if (nick) return nick.toUpperCase();
      const base = [p.name, p.surname].filter(Boolean).join(" ").trim();
      return (base || `JUGADOR ${p.number ?? ""}`).toUpperCase();
    });
    return { names, fieldType: null };
  } catch {
    return { names: [], fieldType: null };
  }
}
