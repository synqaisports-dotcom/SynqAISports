import type {
  CurveShapeElement,
  DrawingElement,
  ExerciseDrawingDocument,
  LegacyStroke,
  LineShapeElement,
  MaterialElement,
  RectShapeElement,
  WaveShapeElement,
} from '@/lib/exercise-drawing';
import { getElementAnchors, wavePathPoints } from '@/lib/exercise-drawing';

type Props = {
  document: ExerciseDrawingDocument;
  selectedId: string | null;
  showAnchors?: boolean;
  onSelect?: (id: string | null) => void;
};

const VB = 100;

function toVb(nx: number, ny: number) {
  return { x: nx * VB, y: ny * VB };
}

function dashArray(dash: boolean) {
  return dash ? '2.5 1.8' : undefined;
}

export function DrawingScene({
  document,
  selectedId,
  showAnchors = false,
  onSelect,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
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
                cx={anchor.x * VB}
                cy={anchor.y * VB}
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
      const x = (point[0] / 400) * VB;
      const y = (point[1] / 440) * VB;
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
  switch (element.type) {
    case 'shape-line':
      return <LineShape element={element} selected={selected} />;
    case 'shape-curve':
      return <CurveShape element={element} selected={selected} />;
    case 'shape-wave':
      return <WaveShape element={element} selected={selected} />;
    case 'shape-rect':
      return <RectShape element={element} selected={selected} />;
    case 'material':
      return <MaterialShape element={element} selected={selected} />;
    default:
      return null;
  }
}

function LineShape({ element, selected }: { element: LineShapeElement; selected: boolean }) {
  const p1 = toVb(element.x1, element.y1);
  const p2 = toVb(element.x2, element.y2);
  const color = selected ? '#22d3ee' : element.style.color;
  const sw = element.style.width / 2.8;

  if (element.arrowEnd || element.arrowStart) {
    const markerEnd = element.arrowEnd ? `url(#arrow-end-${element.id})` : undefined;
    const markerStart = element.arrowStart ? `url(#arrow-start-${element.id})` : undefined;
    return (
      <g>
        <defs>
          {element.arrowEnd ? (
            <marker
              id={`arrow-end-${element.id}`}
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill={color} />
            </marker>
          ) : null}
          {element.arrowStart ? (
            <marker
              id={`arrow-start-${element.id}`}
              markerWidth="4"
              markerHeight="4"
              refX="1"
              refY="2"
              orient="auto"
            >
              <polygon points="4 0, 0 2, 4 4" fill={color} />
            </marker>
          ) : null}
        </defs>
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={dashArray(element.style.dash)}
          markerEnd={markerEnd}
          markerStart={markerStart}
        />
      </g>
    );
  }

  return (
    <line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeDasharray={dashArray(element.style.dash)}
    />
  );
}

function CurveShape({ element, selected }: { element: CurveShapeElement; selected: boolean }) {
  const p1 = toVb(element.x1, element.y1);
  const p2 = toVb(element.x2, element.y2);
  const pc = toVb(element.cx, element.cy);
  const color = selected ? '#22d3ee' : element.style.color;
  const sw = element.style.width / 2.8;
  const path = `M ${p1.x} ${p1.y} Q ${pc.x} ${pc.y} ${p2.x} ${p2.y}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={dashArray(element.style.dash)}
      />
      {element.arrowEnd ? (
        <polygon
          points={arrowHead(p2.x, p2.y, Math.atan2(p2.y - pc.y, p2.x - pc.x), color)}
          fill={color}
        />
      ) : null}
    </g>
  );
}

function WaveShape({ element, selected }: { element: WaveShapeElement; selected: boolean }) {
  const p1 = toVb(element.x1, element.y1);
  const p2 = toVb(element.x2, element.y2);
  const amp = element.amplitude * VB;
  const pts = wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp);
  const color = selected ? '#22d3ee' : element.style.color;
  const sw = element.style.width / 2.8;
  const d = pts.reduce((acc, val, i) => {
    if (i % 2 !== 0) return acc;
    const x = pts[i];
    const y = pts[i + 1];
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeDasharray={dashArray(element.style.dash)}
    />
  );
}

function RectShape({ element, selected }: { element: RectShapeElement; selected: boolean }) {
  const p = toVb(element.x, element.y);
  const color = selected ? '#22d3ee' : element.style.color;
  const fill = selected ? '#22d3ee' : element.fill;
  const cx = p.x + (element.width * VB) / 2;
  const cy = p.y + (element.height * VB) / 2;

  return (
    <rect
      x={p.x}
      y={p.y}
      width={element.width * VB}
      height={element.height * VB}
      fill={fill}
      fillOpacity={element.fillOpacity}
      stroke={color}
      strokeWidth={element.style.width / 2.8}
      strokeDasharray={dashArray(element.style.dash)}
      transform={`rotate(${element.rotation} ${cx} ${cy})`}
    />
  );
}

function MaterialShape({ element, selected }: { element: MaterialElement; selected: boolean }) {
  const p = toVb(element.x, element.y);
  const size = element.scale * 9;

  if (element.material.startsWith('player')) {
    const fill =
      selected
        ? '#22d3ee'
        : element.material === 'player-rival'
          ? '#ef4444'
          : element.material === 'player-neutral'
            ? '#a78bfa'
            : '#06b6d4';
    const label =
      element.label ??
      (element.material === 'player-rival' ? 'X' : element.material === 'player-neutral' ? 'N' : '1');
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <circle cx={p.x} cy={p.y} r={size / 2} fill={fill} stroke="#0f172a" strokeWidth={0.5} />
        <circle cx={p.x} cy={p.y} r={size / 2.2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.25} />
        <text
          x={p.x}
          y={p.y + size * 0.08}
          textAnchor="middle"
          fontSize={size * 0.42}
          fontWeight="700"
          fill="#0f172a"
          style={{ userSelect: 'none' }}
        >
          {label}
        </text>
        <polygon
          points={`${p.x},${p.y - size * 0.72} ${p.x - size * 0.22},${p.y - size * 0.46} ${p.x + size * 0.22},${p.y - size * 0.46}`}
          fill={fill}
          stroke="#0f172a"
          strokeWidth={0.3}
        />
      </g>
    );
  }

  if (element.material === 'cone') {
    const h = size * 0.85;
    const w = size * 0.55;
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <polygon
          points={`${p.x},${p.y - h / 2} ${p.x - w},${p.y + h / 2} ${p.x + w},${p.y + h / 2}`}
          fill={selected ? '#22d3ee' : '#f97316'}
          stroke="#9a3412"
          strokeWidth={0.35}
        />
      </g>
    );
  }

  if (element.material === 'cone-pole') {
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <circle cx={p.x} cy={p.y - size * 0.35} r={size * 0.12} fill="#fde047" />
        <rect
          x={p.x - size * 0.05}
          y={p.y - size * 0.28}
          width={size * 0.1}
          height={size * 0.65}
          fill={selected ? '#22d3ee' : '#cbd5e1'}
        />
      </g>
    );
  }

  if (element.material === 'ball') {
    return (
      <g>
        <circle
          cx={p.x}
          cy={p.y}
          r={size * 0.38}
          fill={selected ? '#22d3ee' : '#f8fafc'}
          stroke="#0f172a"
          strokeWidth={0.45}
        />
      </g>
    );
  }

  if (element.material === 'goal') {
    const w = size * 1.4;
    const h = w * 0.35;
    const stroke = selected ? '#22d3ee' : '#e2e8f0';
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} fill="none" stroke={stroke} strokeWidth={0.8} />
        <line x1={p.x - w / 2} y1={p.y - h / 2} x2={p.x - w / 2} y2={p.y + h / 2} stroke={stroke} strokeWidth={1.2} />
        <line x1={p.x + w / 2} y1={p.y - h / 2} x2={p.x + w / 2} y2={p.y + h / 2} stroke={stroke} strokeWidth={1.2} />
      </g>
    );
  }

  if (element.material === 'hurdle') {
    const w = size * 1.1;
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <rect x={p.x - w / 2} y={p.y - size * 0.08} width={w} height={size * 0.12} fill={selected ? '#22d3ee' : '#f97316'} />
        <rect x={p.x - w / 2 + 2} y={p.y} width={size * 0.08} height={size * 0.45} fill="#94a3b8" />
        <rect x={p.x + w / 2 - size * 0.08 - 2} y={p.y} width={size * 0.08} height={size * 0.45} fill="#94a3b8" />
      </g>
    );
  }

  if (element.material === 'ladder') {
    const w = size * 1.1;
    const stroke = selected ? '#22d3ee' : '#fbbf24';
    return (
      <g transform={`rotate(${element.rotation} ${p.x} ${p.y})`}>
        <line x1={p.x - w / 2} y1={p.y - size * 0.35} x2={p.x - w / 2} y2={p.y + size * 0.35} stroke={stroke} strokeWidth={1} />
        <line x1={p.x + w / 2} y1={p.y - size * 0.35} x2={p.x + w / 2} y2={p.y + size * 0.35} stroke={stroke} strokeWidth={1} />
        {[0, 1, 2, 3, 4].map((i) => {
          const y = p.y - size * 0.3 + i * (size * 0.15);
          return (
            <line key={i} x1={p.x - w / 2} y1={y} x2={p.x + w / 2} y2={y} stroke={stroke} strokeWidth={0.8} />
          );
        })}
      </g>
    );
  }

  return null;
}

function arrowHead(x: number, y: number, angle: number, color: string): string {
  const head = 3.5;
  const x1 = x - head * Math.cos(angle - 0.4);
  const y1 = y - head * Math.sin(angle - 0.4);
  const x2 = x - head * Math.cos(angle + 0.4);
  const y2 = y - head * Math.sin(angle + 0.4);
  return `${x},${y} ${x1},${y1} ${x2},${y2}`;
}
