'use client';

import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Session = { id: string; title: string; day: string };
type Microcycle = { id: string; title: string; sessions: Session[] };
type Mesocycle = { id: string; title: string; microcycles: Microcycle[] };
type Macrocycle = { id: string; title: string; trainingsPerWeek: 2 | 3; mesocycles: Mesocycle[] };

const demoData: Macrocycle[] = [
  {
    id: 'macro-1',
    title: 'Pretemporada 2026/27',
    trainingsPerWeek: 3,
    mesocycles: [
      {
        id: 'meso-1',
        title: 'Mesociclo 1 — Adaptación',
        microcycles: [
          {
            id: 'micro-1',
            title: 'Microciclo 1',
            sessions: [
              { id: 's1', title: 'Sesión técnica', day: 'Martes' },
              { id: 's2', title: 'Sesión táctica', day: 'Jueves' },
              { id: 's3', title: 'Partido amistoso', day: 'Sábado' },
            ],
          },
          {
            id: 'micro-2',
            title: 'Microciclo 2',
            sessions: [
              { id: 's4', title: 'Físico + técnica', day: 'Martes' },
              { id: 's5', title: 'Unidad de juego', day: 'Jueves' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'macro-2',
    title: 'Competición — 1ª vuelta',
    trainingsPerWeek: 2,
    mesocycles: [
      {
        id: 'meso-2',
        title: 'Mesociclo competitivo A',
        microcycles: [
          {
            id: 'micro-3',
            title: 'Semana partido',
            sessions: [
              { id: 's6', title: 'Activación', day: 'Miércoles' },
              { id: 's7', title: 'Partido liga', day: 'Domingo' },
            ],
          },
        ],
      },
    ],
  },
];

export function PlanogramTree() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Planograma de periodización</CardTitle>
          <CardDescription>
            Macrociclos → mesociclos → microciclos → sesiones. Cada bloque es expandible.
            Indica si el equipo entrena 2 o 3 veces por semana.
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={['macro-1']} className="space-y-2">
        {demoData.map((macro) => (
          <AccordionItem
            key={macro.id}
            value={macro.id}
            className="rounded-lg border bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-3 text-left">
                <span className="font-semibold">{macro.title}</span>
                <Badge variant="outline">{macro.trainingsPerWeek} entrenos/sem</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <Accordion type="multiple" defaultValue={[macro.mesocycles[0]?.id]} className="ml-2 space-y-2 border-l pl-4">
                {macro.mesocycles.map((meso) => (
                  <AccordionItem key={meso.id} value={meso.id} className="border-0 border-b last:border-0">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      {meso.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="multiple" className="ml-2 space-y-1 border-l pl-3">
                        {meso.microcycles.map((micro) => (
                          <AccordionItem key={micro.id} value={micro.id} className="border-0">
                            <AccordionTrigger className="py-2 text-sm hover:no-underline">
                              {micro.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 pl-2">
                                {micro.sessions.map((session) => (
                                  <li
                                    key={session.id}
                                    className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm"
                                  >
                                    <span>{session.title}</span>
                                    <Badge variant="secondary">{session.day}</Badge>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
