'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Circle,
  CircleDot,
  Goal,
  MousePointer2,
  Square,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldBackground } from '@/components/methodology/drawing/FieldBackground';
import { DrawingScene } from '@/components/methodology/drawing/DrawingScene';
import {
  type DrawingTool,
  type ExerciseDrawingDocument,
  FIELD_TEMPLATES,
  type FieldTemplate,
  defaultElementForTool,
  getElementAnchors,
  parseExerciseDrawing,
  serializeExerciseDrawing,
  updateElementAnchor,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  initialData?: unknown;
  onClose: () => void;
  onSave: (json: string) => void;
};

const TOOLS: { id: DrawingTool; label: string; icon: ReactNode; group: string }[] = [
  { id: 'select', label: 'Seleccionar', icon: <MousePointer2 className="size-4" />, group: 'General' },
  { id: 'arrow', label: 'Flecha', icon: <ArrowRight className="size-4" />, group: 'Movimiento' },
  { id: 'dashed-arrow', label: 'Flecha discontinua', icon: <ArrowRight className="size-4 opacity-60" />, group: 'Movimiento' },
  { id: 'line', label: 'Línea', icon: <span className="text-xs font-bold">—</span>, group: 'Movimiento' },
  { id: 'player', label: 'Jugador propio', icon: <Circle className="size-4 text-cyan-400" />, group: 'Objetos' },
  { id: 'player-rival', label: 'Jugador rival', icon: <Circle className="size-4 text-red-400" />, group: 'Objetos' },
  { id: 'cone', label: 'Cono', icon: <span className="text-sm">🔺</span>, group: 'Objetos' },
  { id: 'ball', label: 'Balón', icon: <CircleDot className="size-4" />, group: 'Objetos' },
  { id: 'goal', label: 'Portería', icon: <Goal className="size-4" />, group: 'Objetos' },
  { id: 'zone', label: 'Zona', icon: <Square className="size-4" />, group: 'Formas' },
  { id: 'text', label: 'Texto', icon: <Type className="size-4" />, group: 'Formas' },
];

export function ExerciseDrawingModal({ open, initialData, onClose, onSave }: Props) {
  const [doc, setDoc] = useState<ExerciseDrawingDocument>(() => parseExerciseDrawing(initialData));
  const [tool, setTool] = useState<DrawingTool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ elementId: string; role: string } | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDoc(parseExerciseDrawing(initialData));
      setSelectedId(null);
      setTool('select');
    }
  }, [open, initialData]);

  const normFromEvent = useCallback((clientX: number, clientY: number) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const handleFieldPointerDown = (event: React.PointerEvent) => {
    if (tool === 'select') return;
    const { x, y } = normFromEvent(event.clientX, event.clientY);
    const element = defaultElementForTool(tool, x, y);
    if (!element) return;
    setDoc((current) => ({ ...current, elements: [...current.elements, element] }));
    setSelectedId(element.id);
    setTool('select');
  };

  const handleAnchorPointerDown = (
    event: React.PointerEvent,
    elementId: string,
    role: string
  ) => {
    event.stopPropagation();
    setDragging({ elementId, role });
    (event.target as Element).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    const { x, y } = normFromEvent(event.clientX, event.clientY);
    setDoc((current) => ({
      ...current,
      elements: current.elements.map((el) =>
        el.id === dragging.elementId ? updateElementAnchor(el, dragging.role, x, y) : el
      ),
    }));
  };

  const handlePointerUp = () => setDragging(null);

  const deleteSelected = () => {
    if (!selectedId) return;
    setDoc((current) => ({
      ...current,
      elements: current.elements.filter((el) => el.id !== selectedId),
    }));
    setSelectedId(null);
  };

  const selected = doc.elements.find((el) => el.id === selectedId) ?? null;

  if (!open) return null;

  const toolGroups = [...new Set(TOOLS.map((item) => item.group))];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md">
      <header className="flex shrink-0 items-center justify-between border-b border-primary/20 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Pizarra de dibujo</h2>
          <p className="text-xs text-muted-foreground">
            Estilo Camelot / OnFormación · arrastra los puntos para ajustar
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onSave(serializeExerciseDrawing(doc));
              onClose();
            }}
          >
            Guardar dibujo
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        {/* Campo 40 % */}
        <div className="flex w-full shrink-0 items-center justify-center lg:w-[40%]">
          <div className="relative w-full max-w-full" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
            <FieldBackground template={doc.field} className="w-full" />
            <div
              ref={fieldRef}
              className="absolute inset-0"
              onPointerDown={handleFieldPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <DrawingScene
                document={doc}
                selectedId={selectedId}
                showAnchors={tool === 'select'}
                onSelect={setSelectedId}
              />
              {tool === 'select' && selectedId
                ? doc.elements
                    .filter((el) => el.id === selectedId)
                    .flatMap((el) => getElementAnchors(el))
                    .map((anchor) => (
                      <div
                        key={anchor.id}
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${anchor.x * 100}%`,
                          top: `${anchor.y * 100}%`,
                          width: 14,
                          height: 14,
                        }}
                        onPointerDown={(event) =>
                          handleAnchorPointerDown(event, anchor.elementId, anchor.role)
                        }
                      >
                        <span className="block size-3.5 rounded-full border-2 border-cyan-400 bg-cyan-300 shadow" />
                      </div>
                    ))
                : null}
            </div>
          </div>
        </div>

        {/* Herramientas 60 % */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-primary/20 bg-muted/10 p-4">
          <section className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campo base
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FIELD_TEMPLATES) as FieldTemplate[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDoc((current) => ({ ...current, field: key }))}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                    doc.field === key
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-primary/15 hover:bg-primary/5'
                  )}
                >
                  <span className="font-medium">{FIELD_TEMPLATES[key].label}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {FIELD_TEMPLATES[key].description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {toolGroups.map((group) => (
            <section key={group} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TOOLS.filter((item) => item.group === group).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTool(item.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                      tool === item.id
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-primary/15 hover:border-primary/35 hover:bg-primary/5'
                    )}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}

          {selected ? (
            <section className="mt-auto rounded-lg border border-primary/20 bg-background/60 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Elemento seleccionado</p>
              <p className="text-sm capitalize">{selected.type}</p>
              {selected.type === 'text' ? (
                <input
                  className="mt-2 w-full rounded border border-primary/25 bg-background px-2 py-1 text-sm"
                  value={selected.text}
                  onChange={(event) =>
                    setDoc((current) => ({
                      ...current,
                      elements: current.elements.map((el) =>
                        el.id === selected.id && el.type === 'text'
                          ? { ...el, text: event.target.value }
                          : el
                      ),
                    }))
                  }
                />
              ) : null}
              {selected.type === 'player' ? (
                <input
                  className="mt-2 w-full rounded border border-primary/25 bg-background px-2 py-1 text-sm"
                  value={selected.label ?? ''}
                  placeholder="Número"
                  onChange={(event) =>
                    setDoc((current) => ({
                      ...current,
                      elements: current.elements.map((el) =>
                        el.id === selected.id && el.type === 'player'
                          ? { ...el, label: event.target.value }
                          : el
                      ),
                    }))
                  }
                />
              ) : null}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-3 gap-1"
                onClick={deleteSelected}
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </Button>
            </section>
          ) : (
            <p className="mt-auto text-xs text-muted-foreground">
              Elige una herramienta y pulsa en el campo para colocar el elemento. Con
              «Seleccionar», arrastra los puntos cyan para modificar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
