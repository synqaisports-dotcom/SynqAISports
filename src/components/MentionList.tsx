import type { MentionSnippet } from '@/lib/radar-types';

export function MentionList({ snippets }: { snippets: MentionSnippet[] | null | undefined }) {
  if (!snippets?.length) return null;

  return (
    <ul className="mt-3 space-y-2 border-t border-white/5 pt-3">
      {snippets.map((m, i) => (
        <li key={`${m.link}-${i}`} className="text-[11px] leading-snug text-slate-400">
          <span className="mr-1.5 rounded bg-white/5 px-1 py-0.5 font-mono-data text-[9px] text-slate-500">
            {m.channel}
          </span>
          {m.link ? (
            <a href={m.link} target="_blank" rel="noopener noreferrer" className="hover:text-tp-cyan">
              {m.title_es}
            </a>
          ) : (
            m.title_es
          )}
          {m.title !== m.title_es && (
            <span className="mt-0.5 block truncate text-[10px] text-slate-600" title={m.title}>
              Original: {m.title}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
