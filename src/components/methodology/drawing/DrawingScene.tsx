import type {
  DrawingElement,
  ExerciseDrawingDocument,
  LegacyStroke,
} from '@/lib/exercise-drawing';
import { getElementAnchors } from '@/lib/exercise-drawing';

type Props = {
  document: ExerciseDrawingDocument;
  selectedId: string | null;
  showAnchors?: boolean;
  onSelect?: (id: string | null) => void;
};

export function DrawingScene({
  document,
  selectedId,
  showAnchors = false,
  onSelect,
}: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full touch-none"
      onClick={(event) => {
        if (event.target === event.currentTarget) onSelect?.(null);
      }}
    >
      {document.legacyStrokes?.map((stroke, index) => (
        <LegacyStrokePath key={`legacy-${index}`} stroke={stroke} />
      ))}
      {document.elements.map((element) => (
        <g
          key={element.id}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(element.id);
          }}
          className="cursor-pointer"
          opacity={selectedId && selectedId !== element.id ? 0.72 : 1}
        >
          <DrawingElementShape element={element} selected={selectedId === element.id} />
        </g>
      ))}
      {showAnchors && selectedId
        ? document.elements
            .filter((el) => el.id === selectedId)
            .flatMap((el) => getElementAnchors(el))
            .map((anchor) => (
              <circle
                key={anchor.id}
                cx={anchor.x * 100}
                cy={anchor.y * 100}
                r={1.8}
                fill="#22d3ee"
                stroke="#0f172a"
                strokeWidth={0.4}
                className="pointer-events-none"
              />
            ))
        : null}
    </svg>
  );
}

function LegacyStrokePath({ stroke }: { stroke: LegacyStroke }) {
  if (stroke.points.length < 2) return null;
  const d = stroke.points
    .map((point, index) => {
      const x = (point[0] / 400) * 100;
      const y = (point[1] / 440) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke.color}
      strokeWidth={stroke.width / 8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
    />
  );
}

function DrawingElementShape({
  element,
  selected,
}: {
  element: DrawingElement;
  selected: boolean;
}) {
  const sel = selected ? '#22d3ee' : undefined;

  switch (element.type) {
    case 'arrow':
      return <ArrowShape element={element} highlight={sel} />;
    case 'line':
      return <LineShape element={element} highlight={sel} />;
    case 'player':
      return <PlayerShape element={element} highlight={sel} />;
    case 'cone':
      return <ConeShape element={element} highlight={sel} />;
    case 'ball':
      return <BallShape element={element} highlight={sel} />;
    case 'goal':
      return <GoalShape element={element} highlight={sel} />;
    case 'zone':
      return <ZoneShape element={element} highlight={sel} />;
    case 'text':
      return <TextShape element={element} highlight={sel} />;
    default:
      return null;
  }
}

function ArrowShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'arrow' }>;
  highlight?: string;
}) {
  const color = highlight ?? element.color ?? '#fbbf24';
  const x1 = element.x1 * 100;
  const y1 = element.y1 * 100;
  const x2 = element.x2 * 100;
  const y2 = element.y2 * 100;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 3.5;
  const markerId = `arrow-${element.id}`;
  const path = element.curved
    ? `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 8} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <polygon points="0 0, 4 2, 0 4" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeDasharray={element.dashed ? '2 1.5' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <polygon
        points={`${x2},${y2} ${x2 - head * Math.cos(angle - 0.4)},${y2 - head * Math.sin(angle - 0.4)} ${x2 - head * Math.cos(angle + 0.4)},${y2 - head * Math.sin(angle + 0.4)}`}
        fill={color}
      />
    </g>
  );
}

function LineShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'line' }>;
  highlight?: string;
}) {
  return (
    <line
      x1={element.x1 * 100}
      y1={element.y1 * 100}
      x2={element.x2 * 100}
      y2={element.y2 * 100}
      stroke={highlight ?? element.color ?? '#fff'}
      strokeWidth={1}
      strokeLinecap="round"
      strokeDasharray={element.dashed ? '2 1.5' : undefined}
    />
  );
}

function PlayerShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'player' }>;
  highlight?: string;
}) {
  const cx = element.x * 100;
  const cy = element.y * 100;
  const fill =
    highlight ??
    (element.team === 'rival' ? '#ef4444' : element.team === 'neutral' ? '#a78bfa' : '#06b6d4');
  const stroke = '#0f172a';

  return (
    <g transform={`rotate(${element.rotation ?? 0} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={3.8} fill={fill} stroke={stroke} strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={3.2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.25} />
      <text
        x={cx}
        y={cy + 1.1}
        textAnchor="middle"
        fontSize="3.2"
        fontWeight="700"
        fill="#0f172a"
        style={{ userSelect: 'none' }}
      >
        {element.label ?? (element.team === 'rival' ? 'X' : '1')}
      </text>
      <polygon
        points={`${cx},${cy - 5.5} ${cx - 1.8},${cy - 3.5} ${cx + 1.8},${cy - 3.5}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.3}
      />
    </g>
  );
}

function ConeShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'cone' }>;
  highlight?: string;
}) {
  const cx = element.x * 100;
  const cy = element.y * 100;
  const fill = highlight ?? element.color ?? '#f97316';
  const h = element.variant === 'mini' ? 3 : element.variant === 'pole' ? 5.5 : 4.5;
  const w = element.variant === 'pole' ? 1.2 : 3.5;

  if (element.variant === 'pole') {
    return (
      <g transform={`rotate(${element.rotation ?? 0} ${cx} ${cy})`}>
        <rect x={cx - w / 2} y={cy - h} width={w} height={h} fill={fill} rx={0.3} />
        <circle cx={cx} cy={cy - h} r={1} fill="#fde047" />
      </g>
    );
  }

  return (
    <g transform={`rotate(${element.rotation ?? 0} ${cx} ${cy})`}>
      <polygon
        points={`${cx},${cy - h} ${cx - w},${cy + 1} ${cx + w},${cy + 1}`}
        fill={fill}
        stroke="#9a3412"
        strokeWidth={0.35}
      />
      <ellipse cx={cx} cy={cy + 1.2} rx={w} ry={0.9} fill="#c2410c" opacity={0.5} />
    </g>
  );
}

function BallShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'ball' }>;
  highlight?: string;
}) {
  const cx = element.x * 100;
  const cy = element.y * 100;
  return (
    <g>
      <circle cx={cx} cy={cy} r={2.6} fill={highlight ? '#22d3ee' : '#f8fafc'} stroke="#0f172a" strokeWidth={0.45} />
      <path
        d={`M ${cx} ${cy - 1.5} L ${cx + 1.2} ${cy - 0.3} L ${cx + 0.7} ${cy + 1.2} L ${cx - 0.7} ${cy + 1.2} L ${cx - 1.2} ${cy - 0.3} Z`}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={0.3}
      />
    </g>
  );
}

function GoalShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'goal' }>;
  highlight?: string;
}) {
  const cx = element.x * 100;
  const cy = element.y * 100;
  const w = element.width * 100;
  const h = w * 0.35;
  const stroke = highlight ?? element.color ?? '#e2e8f0';
  return (
    <g transform={`rotate(${element.rotation ?? 0} ${cx} ${cy})`}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke={stroke} strokeWidth={0.8} />
      <line x1={cx - w / 2} y1={cy - h / 2} x2={cx - w / 2} y2={cy + h / 2} stroke={stroke} strokeWidth={1.2} />
      <line x1={cx + w / 2} y1={cy - h / 2} x2={cx + w / 2} y2={cy + h / 2} stroke={stroke} strokeWidth={1.2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={cx - w / 2 + (w / 4) * i}
          y1={cy - h / 2}
          x2={cx - w / 2 + (w / 4) * i}
          y2={cy + h / 2}
          stroke={stroke}
          strokeWidth={0.2}
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function ZoneShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'zone' }>;
  highlight?: string;
}) {
  const color = highlight ?? element.color ?? '#22d3ee';
  return (
    <rect
      x={element.x * 100}
      y={element.y * 100}
      width={element.width * 100}
      height={element.height * 100}
      fill={color}
      fillOpacity={element.opacity ?? 0.22}
      stroke={color}
      strokeWidth={highlight ? 1.2 : 0.6}
      strokeDasharray="2 1"
      transform={`rotate(${element.rotation ?? 0} ${(element.x + element.width / 2) * 100} ${(element.y + element.height / 2) * 100})`}
    />
  );
}

function TextShape({
  element,
  highlight,
}: {
  element: Extract<DrawingElement, { type: 'text' }>;
  highlight?: string;
}) {
  return (
    <text
      x={element.x * 100}
      y={element.y * 100}
      fill={highlight ?? element.color ?? '#fff'}
      fontSize={element.fontSize ?? 4}
      fontWeight="600"
      style={{ userSelect: 'none' }}
    >
      {element.text}
    </text>
  );
}
