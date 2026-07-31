'use client';

import Link from 'next/link';
import { ROUND_KEY_LABELS } from '@/lib/tournaments';
import { type TournamentBundle, type TournamentMatch, type RoundKey } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { ExternalLink, Radio } from 'lucide-react';
import { mesaFieldUrlForMatch } from '@/lib/tournament-mesa-field';

const MAIN_ROUNDS: RoundKey[] = ['r16', 'qf', 'sf', 'final'];
const SLOT_HEIGHT = 68;
const MATCH_WIDTH = 176;
const CONNECTOR_WIDTH = 28;

type BracketNode = {
  match: TournamentMatch | null;
  children: [BracketNode, BracketNode] | null;
  isBye?: boolean;
};

type RoundData = { round: RoundKey; matches: TournamentMatch[] };

function teamName(bundle: TournamentBundle, id: string | null) {
  if (!id) return 'Por determinar';
  return bundle.teams.find((t) => t.id === id)?.name ?? '—';
}

function MatchSlot({
  match,
  bundle,
  accentColor,
  isBye,
}: {
  match: TournamentMatch | null;
  bundle: TournamentBundle;
  accentColor?: string;
  isBye?: boolean;
}) {
  if (!match) {
    return (
      <div
        className={cn(
          'flex h-[3.25rem] shrink-0 items-center justify-center rounded-lg border border-dashed bg-background/20 text-[10px] text-muted-foreground',
          isBye ? 'border-amber-400/30 text-amber-200/70' : 'border-border/50'
        )}
        style={{ width: MATCH_WIDTH }}
      >
        {isBye ? 'Bye directo' : 'Por determinar'}
      </div>
    );
  }

  const isLive = match.status === 'live';
  const home = teamName(bundle, match.home_team_id);
  const away = teamName(bundle, match.away_team_id);
  const homeWins =
    match.status === 'finished' &&
    (match.score_home > match.score_away ||
      (match.went_to_penalties && (match.score_penalties_home ?? 0) > (match.score_penalties_away ?? 0)));
  const awayWins =
    match.status === 'finished' &&
    (match.score_away > match.score_home ||
      (match.went_to_penalties && (match.score_penalties_away ?? 0) > (match.score_penalties_home ?? 0)));

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg border border-border/70 bg-background/50 text-xs shadow-sm',
        isLive && 'border-cyan-400/50 shadow-[0_0_16px_hsl(183_100%_50%_/_0.12)]'
      )}
      style={{
        width: MATCH_WIDTH,
        borderTopColor: accentColor ? `${accentColor}88` : undefined,
        borderTopWidth: accentColor ? 2 : undefined,
      }}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-1 border-b border-border/40 px-2 py-1.5',
          homeWins && 'bg-primary/10'
        )}
      >
        <span className="min-w-0 flex-1 truncate font-medium">{home}</span>
        <span className="shrink-0 tabular-nums font-semibold text-primary">
          {match.status === 'scheduled' ? '' : match.score_home}
        </span>
      </div>
      <div className={cn('flex items-center justify-between gap-1 px-2 py-1.5', awayWins && 'bg-primary/10')}>
        <span className="min-w-0 flex-1 truncate font-medium">{away}</span>
        <span className="shrink-0 tabular-nums font-semibold text-primary">
          {match.status === 'scheduled' ? '' : match.score_away}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 bg-background/30 px-2 py-0.5 text-[9px] text-muted-foreground">
        <span>#{match.match_number}</span>
        <div className="flex items-center gap-1">
          {isLive ? <Radio className="size-3 animate-pulse text-cyan-300" /> : null}
          {match.status === 'finished' && match.went_to_penalties ? (
            <span className="text-[8px]">pen.</span>
          ) : null}
          {(() => {
            const mesaHref = mesaFieldUrlForMatch(bundle, match);
            return mesaHref ? (
              <Link href={mesaHref} target="_blank" className="text-cyan-300 hover:text-cyan-200">
                <ExternalLink className="size-3" />
              </Link>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}

function PairConnector({ direction, height }: { direction: 'left' | 'right'; height: number }) {
  const midY = height / 2;
  const topY = SLOT_HEIGHT / 2;
  const bottomY = height - SLOT_HEIGHT / 2;
  const stroke = 'rgba(34, 211, 238, 0.5)';

  if (direction === 'left') {
    return (
      <svg width={CONNECTOR_WIDTH} height={height} className="shrink-0" aria-hidden>
        <path
          d={`M 0 ${topY} H ${CONNECTOR_WIDTH / 2} V ${midY} H ${CONNECTOR_WIDTH}`}
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d={`M 0 ${bottomY} H ${CONNECTOR_WIDTH / 2} V ${midY}`}
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width={CONNECTOR_WIDTH} height={height} className="shrink-0" aria-hidden>
      <path
        d={`M ${CONNECTOR_WIDTH} ${topY} H ${CONNECTOR_WIDTH / 2} V ${midY} H 0`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d={`M ${CONNECTOR_WIDTH} ${bottomY} H ${CONNECTOR_WIDTH / 2} V ${midY}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function FinalConnector({ direction, height }: { direction: 'left' | 'right'; height: number }) {
  const midY = height / 2;
  const stroke = 'rgba(34, 211, 238, 0.6)';

  if (direction === 'left') {
    return (
      <svg width={CONNECTOR_WIDTH} height={height} className="shrink-0" aria-hidden>
        <path d={`M 0 ${midY} H ${CONNECTOR_WIDTH}`} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width={CONNECTOR_WIDTH} height={height} className="shrink-0" aria-hidden>
      <path d={`M ${CONNECTOR_WIDTH} ${midY} H 0`} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function subtreeHeight(node: BracketNode): number {
  if (!node.children) return SLOT_HEIGHT;
  return subtreeHeight(node.children[0]) + subtreeHeight(node.children[1]);
}

function BranchTree({
  node,
  direction,
  bundle,
  accentColor,
}: {
  node: BracketNode;
  direction: 'left' | 'right';
  bundle: TournamentBundle;
  accentColor?: string;
}) {
  if (!node.children) {
    return (
      <div className="flex items-center" style={{ height: SLOT_HEIGHT }}>
        <MatchSlot match={node.match} bundle={bundle} accentColor={accentColor} isBye={node.isBye} />
      </div>
    );
  }

  const [top, bottom] = node.children;
  const pairHeight = subtreeHeight(node);
  const hasParent = node.match != null;

  const childrenColumn = (
    <div className="flex flex-col justify-between" style={{ height: pairHeight }}>
      <BranchTree node={top} direction={direction} bundle={bundle} accentColor={accentColor} />
      <BranchTree node={bottom} direction={direction} bundle={bundle} accentColor={accentColor} />
    </div>
  );

  if (direction === 'left') {
    return (
      <div className="flex items-center">
        {childrenColumn}
        <PairConnector direction="left" height={pairHeight} />
        {hasParent ? (
          <div className="flex items-center" style={{ height: pairHeight }}>
            <MatchSlot match={node.match} bundle={bundle} accentColor={accentColor} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {hasParent ? (
        <div className="flex items-center" style={{ height: pairHeight }}>
          <MatchSlot match={node.match} bundle={bundle} accentColor={accentColor} />
        </div>
      ) : null}
      <PairConnector direction="right" height={pairHeight} />
      {childrenColumn}
    </div>
  );
}

function organizeRounds(matches: TournamentMatch[]): RoundData[] {
  return MAIN_ROUNDS.map((round) => ({
    round,
    matches: matches
      .filter((m) => m.round_key === round)
      .sort((a, b) => a.match_number - b.match_number),
  })).filter((r) => r.matches.length > 0);
}

function buildHalfTree(knockoutRounds: RoundData[], side: 'left' | 'right'): BracketNode {
  const leafRound = knockoutRounds[0]!;
  const leafCount = leafRound.matches.length;
  const half = Math.max(1, Math.floor(leafCount / 2));
  const start = side === 'left' ? 0 : leafCount - half;
  const sideLeaves = leafRound.matches.slice(start, start + half);

  let nodes: BracketNode[] = sideLeaves.map((match) => ({ match, children: null }));

  for (let r = 1; r < knockoutRounds.length; r++) {
    const roundMatches = knockoutRounds[r]!.matches;
    const parentIdx = side === 'left' ? 0 : roundMatches.length - 1;
    const parentMatch = roundMatches[parentIdx] ?? null;

    if (nodes.length === 1) {
      nodes = [
        {
          match: parentMatch,
          children: [nodes[0]!, { match: null, children: null, isBye: true }],
        },
      ];
      continue;
    }

    const nextNodes: BracketNode[] = [];
    for (let i = 0; i < nodes.length / 2; i++) {
      nextNodes.push({
        match: r === knockoutRounds.length - 1 ? parentMatch : null,
        children: [nodes[i * 2]!, nodes[i * 2 + 1]!],
      });
    }
    nodes = nextNodes;
  }

  return nodes[0] ?? { match: null, children: null };
}

function buildDualTree(rounds: RoundData[]): BracketNode | null {
  const knockoutRounds = rounds.filter((r) => r.round !== 'final');
  const finalMatch = rounds.find((r) => r.round === 'final')?.matches[0] ?? null;

  if (knockoutRounds.length === 0) {
    return finalMatch ? { match: finalMatch, children: null } : null;
  }

  const left = buildHalfTree(knockoutRounds, 'left');
  const right = buildHalfTree(knockoutRounds, 'right');

  return {
    match: finalMatch,
    children: [left, right],
  };
}

function DualBracketTree({
  root,
  bundle,
  accentColor,
}: {
  root: BracketNode;
  bundle: TournamentBundle;
  accentColor?: string;
}) {
  if (!root.children) {
    return (
      <div className="flex justify-center">
        <MatchSlot match={root.match} bundle={bundle} accentColor={accentColor} />
      </div>
    );
  }

  const [leftBranch, rightBranch] = root.children;
  const branchHeight = Math.max(subtreeHeight(leftBranch), subtreeHeight(rightBranch));

  return (
    <div className="flex items-center justify-center">
      <BranchTree node={leftBranch} direction="left" bundle={bundle} accentColor={accentColor} />
      <FinalConnector direction="left" height={branchHeight} />
      <div className="flex flex-col items-center gap-1 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {ROUND_KEY_LABELS.final}
        </p>
        <MatchSlot match={root.match} bundle={bundle} accentColor={accentColor} />
      </div>
      <FinalConnector direction="right" height={branchHeight} />
      <BranchTree node={rightBranch} direction="right" bundle={bundle} accentColor={accentColor} />
    </div>
  );
}

type Props = {
  matches: TournamentMatch[];
  bundle: TournamentBundle;
  bracketName: string;
  accentColor?: string;
};

export function TournamentBracketVisual({ matches, bundle, bracketName, accentColor }: Props) {
  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin partidos en esta fase.</p>;
  }

  const rounds = organizeRounds(matches);
  const knockoutRounds = rounds.filter((r) => r.round !== 'final');
  const thirdPlace = matches.filter((m) => m.round_key === 'third_place');
  const consolationFinal = matches.filter((m) => m.round_key === 'consolation_final');
  const tree = buildDualTree(rounds);

  const roundLabels = knockoutRounds.map((r) => `${ROUND_KEY_LABELS[r.round]} (${r.matches.length})`);

  return (
    <div className="space-y-4">
      {roundLabels.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 text-[10px] text-muted-foreground">
          {roundLabels.map((label) => (
            <span key={label} className="rounded-full border border-border/50 px-2 py-0.5">
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max justify-center px-4 py-2">
          {tree ? (
            <DualBracketTree root={tree} bundle={bundle} accentColor={accentColor} />
          ) : (
            <p className="text-sm text-muted-foreground">Sin estructura de eliminatoria.</p>
          )}
        </div>
      </div>

      {(thirdPlace.length > 0 || consolationFinal.length > 0) && (
        <div className="flex flex-wrap justify-center gap-8 border-t border-border/40 pt-4">
          {thirdPlace.length > 0 ? (
            <div className="text-center">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {bracketName} · 3.er puesto
              </p>
              <MatchSlot match={thirdPlace[0]!} bundle={bundle} accentColor={accentColor} />
            </div>
          ) : null}
          {consolationFinal.length > 0 ? (
            <div className="text-center">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Final consolación
              </p>
              <MatchSlot match={consolationFinal[0]!} bundle={bundle} accentColor={accentColor} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
