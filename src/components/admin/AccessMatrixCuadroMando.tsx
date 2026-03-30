"use client";

import { cn } from "@/lib/utils";
import {
  CLUB_MODULE_IDS_DISPLAY_ORDER,
  CLUB_MODULE_LABELS,
  CLUB_MODULE_UI_SECTIONS,
  ROLES_TO_MANAGE,
  type ClubModuleId,
  type StaffAccessMatrix,
} from "@/lib/club-permissions";

function Cell({ a, v, e, d }: { a: boolean; v: boolean; e: boolean; d: boolean }) {
  return (
    <div className="flex flex-wrap gap-0.5 justify-center">
      <span className={cn("text-[7px] font-black px-1 rounded", a ? "bg-primary/30 text-primary" : "bg-white/5 text-white/20")}>
        A
      </span>
      <span className={cn("text-[7px] font-black px-1 rounded", v ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20")}>
        V
      </span>
      <span className={cn("text-[7px] font-black px-1 rounded", e ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/20")}>
        E
      </span>
      <span className={cn("text-[7px] font-black px-1 rounded", d ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/20")}>
        X
      </span>
    </div>
  );
}

export function AccessMatrixCuadroMando({
  matrix,
  className,
  theme = "cyan",
}: {
  matrix: StaffAccessMatrix;
  className?: string;
  theme?: "cyan" | "emerald";
}) {
  const headColor = theme === "emerald" ? "text-emerald-400" : "text-primary";
  const borderColor = theme === "emerald" ? "border-emerald-500/20" : "border-primary/20";

  return (
    <div className={cn("overflow-x-auto rounded-2xl border bg-black/30", borderColor, className)}>
      <table className="w-full min-w-[640px] text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th
              rowSpan={2}
              className={cn("p-3 text-[9px] font-black uppercase tracking-widest align-bottom", headColor)}
            >
              Rol / área
            </th>
            {CLUB_MODULE_UI_SECTIONS.map((sec) => (
              <th
                key={sec.id}
                colSpan={sec.modules.length}
                className={cn(
                  "p-2 text-[8px] font-black uppercase tracking-widest text-center border-l border-white/10",
                  headColor,
                )}
              >
                {sec.title}
              </th>
            ))}
          </tr>
          <tr className="border-b border-white/10">
            {CLUB_MODULE_IDS_DISPLAY_ORDER.map((mid) => (
              <th
                key={mid}
                className="p-2 text-[7px] font-black uppercase tracking-tighter text-white/50 text-center max-w-[76px] border-l border-white/5"
                title={CLUB_MODULE_LABELS[mid]}
              >
                {CLUB_MODULE_LABELS[mid]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES_TO_MANAGE.map((role) => (
            <tr key={role.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="p-3 text-[10px] font-bold text-white/80">{role.label}</td>
              {CLUB_MODULE_IDS_DISPLAY_ORDER.map((mid) => {
                const st = matrix[role.id]?.modules?.[mid as ClubModuleId];
                const s = st ?? { access: false, view: false, edit: false, delete: false };
                return (
                  <td key={mid} className="p-2 text-center align-middle">
                    <Cell a={s.access} v={s.view} e={s.edit} d={s.delete} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[8px] font-bold text-white/25 uppercase tracking-widest p-3 border-t border-white/5">
        Leyenda: A=acceder · V=ver · E=editar · X=borrar
      </p>
    </div>
  );
}
