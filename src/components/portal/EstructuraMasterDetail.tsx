'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Network, Pencil, Phone, Plus, Trash2, User } from 'lucide-react';
import { deleteInstitutionalPerson } from '@/app/actions/club-people';
import { InstitutionalPersonForm } from '@/components/portal/InstitutionalPersonForm';
import { PORTAL_ACTION_ICON_CLASS } from '@/components/portal/PortalActionIcon';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  ACCESS_PROFILE_LABELS,
  accessProfileOptions,
  type ClubPerson,
} from '@/lib/club-people';
import { clubPersonInstitutionalFields } from '@/lib/profile-row';
import { cn } from '@/lib/utils';

type EstructuraListSortMode = 'name-asc' | 'name-desc';

type Props = {
  clubId: string;
  people: ClubPerson[];
  initialPersonId?: string | null;
  initialCreateOpen?: boolean;
  initialEditOpen?: boolean;
  demoMode?: boolean;
};

function comparePeople(a: ClubPerson, b: ClubPerson, sort: EstructuraListSortMode): number {
  const cmp = a.full_name.localeCompare(b.full_name, 'es', { sensitivity: 'base' });
  return sort === 'name-desc' ? -cmp : cmp;
}

function EstructuraListPhoto({ person }: { person: ClubPerson }) {
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-muted/20">
      {person.photo_url ? (
        <Image
          src={person.photo_url}
          alt={person.full_name}
          fill
          className="object-cover"
          sizes="44px"
        />
      ) : (
        <User className="size-4 text-primary/70" strokeWidth={1.5} />
      )}
    </div>
  );
}

function EstructuraDetailPanel({
  clubId,
  person,
  initialEditOpen,
  demoMode,
  onDeleted,
}: {
  clubId: string;
  person: ClubPerson | null;
  initialEditOpen?: boolean;
  demoMode?: boolean;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [person?.id, initialEditOpen]);

  if (!person) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona una ficha para ver su detalle o asignarla en el organigrama.
          </p>
        </CardContent>
      </Card>
    );
  }

  const accessLabel =
    person.access_profile && person.access_profile !== 'none'
      ? ACCESS_PROFILE_LABELS[person.access_profile]
      : null;
  const fields = clubPersonInstitutionalFields(person);

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{person.full_name}</CardTitle>
              {accessLabel ? (
                <Badge variant="outline" className="text-[10px]">
                  {accessLabel}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-primary">{person.institutional_role}</p>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
            <button
              type="button"
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Modificar ficha"
              title="Modificar ficha"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
            </button>
            <Link
              href="/portal/club/organigrama"
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Ver organigrama"
              title="Ver organigrama del club"
            >
              <Network className="size-4" />
            </Link>
            <button
              type="button"
              className={cn(PORTAL_ACTION_ICON_CLASS, 'hover:text-destructive')}
              aria-label="Eliminar ficha"
              title="Eliminar ficha"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-stretch">
          <div className="relative mx-auto min-h-[12rem] w-full max-w-[10rem] overflow-hidden rounded-2xl border border-primary/30 bg-muted/20 sm:mx-0 sm:h-full sm:max-w-none">
            {person.photo_url ? (
              <Image
                src={person.photo_url}
                alt={person.full_name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 10rem, 33vw"
              />
            ) : (
              <div className="flex h-full min-h-[12rem] items-center justify-center">
                <User className="size-12 text-primary/60" strokeWidth={1.25} />
              </div>
            )}
          </div>

          <div className={`${sectionClass} space-y-4`}>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contacto
              </p>
              <div className="mt-2 space-y-1.5 text-sm text-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {person.email || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {person.phone || '—'}
                </p>
              </div>
            </div>
            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.label}>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{field.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {person.notes ? (
          <section className={sectionClass}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Notas
            </p>
            <p className="mt-2 text-sm text-foreground">{person.notes}</p>
          </section>
        ) : null}

        <p className="rounded-lg border border-dashed border-primary/20 p-3 text-xs text-muted-foreground">
          Asigna esta persona a un cargo en el organigrama del club para reflejar la jerarquía
          institucional.
        </p>

        {demoMode ? (
          <p className="rounded-lg border border-primary/20 bg-muted/10 p-3 text-xs text-muted-foreground">
            Ficha de demostración. En tu club real podrás guardar cambios y vincular cargos.
          </p>
        ) : null}
      </CardContent>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <PortalSheetContent maxWidth="2xl">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Modificar ficha</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <InstitutionalPersonForm
              key={person.id}
              clubId={clubId}
              person={person}
              onSaved={() => {
                setEditOpen(false);
                router.replace(`/portal/club/estructura?person=${person.id}`, { scroll: false });
                router.refresh();
              }}
            />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>

      <PortalConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar ficha institucional"
        description={`¿Eliminar la ficha de ${person.full_name}? Si está asignada en el organigrama, quedará como vacante.`}
        confirmLabel="Eliminar"
        destructive
        pending={pending}
        onConfirm={() => {
          startTransition(async () => {
            await deleteInstitutionalPerson(clubId, person.id);
            setDeleteOpen(false);
            onDeleted();
            router.refresh();
          });
        }}
      />
    </Card>
  );
}

export function EstructuraMasterDetail({
  clubId,
  people,
  initialPersonId,
  initialCreateOpen,
  initialEditOpen,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [sortMode, setSortMode] = useState<EstructuraListSortMode>('name-asc');
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPersonId && people.some((person) => person.id === initialPersonId)
      ? initialPersonId
      : people[0]?.id ?? null
  );

  const profileOptions = useMemo(() => accessProfileOptions(), []);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...people];

    if (profileFilter !== 'all') {
      list = list.filter((person) => person.access_profile === profileFilter);
    }

    if (query) {
      list = list.filter((person) => {
        const haystack = [
          person.full_name,
          person.institutional_role,
          person.email,
          person.phone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    list.sort((a, b) => comparePeople(a, b, sortMode));
    return list;
  }, [people, search, profileFilter, sortMode]);

  const selectedPerson =
    people.find((person) => person.id === selectedId) ?? filteredPeople[0] ?? null;

  useEffect(() => {
    if (initialPersonId && people.some((person) => person.id === initialPersonId)) {
      setSelectedId(initialPersonId);
    }
  }, [initialPersonId, people]);

  useEffect(() => {
    if (selectedId && !people.some((person) => person.id === selectedId)) {
      setSelectedId(people[0]?.id ?? null);
    }
  }, [people, selectedId]);

  useEffect(() => {
    if (initialCreateOpen) setCreateOpen(true);
  }, [initialCreateOpen]);

  const handleSelect = (personId: string) => {
    setSelectedId(personId);
    router.replace(`/portal/club/estructura?person=${personId}`, { scroll: false });
  };

  const handlePersonSaved = (personId: string) => {
    setCreateOpen(false);
    setSelectedId(personId);
    router.replace(`/portal/club/estructura?person=${personId}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Estructura no deportiva</CardTitle>
              <CardDescription>
                {filteredPeople.length} de {people.length} fichas
              </CardDescription>
            </div>
            <button
              type="button"
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Nueva ficha"
              title="Nueva ficha institucional"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre, cargo o contacto…"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={profileFilter}
                onChange={setProfileFilter}
                options={[
                  { value: 'all', label: 'Todos los perfiles' },
                  ...profileOptions.map((option) => ({
                    value: option.value,
                    label: ACCESS_PROFILE_LABELS[option.value as keyof typeof ACCESS_PROFILE_LABELS],
                  })),
                ]}
              />
              <SynqSelect
                value={sortMode}
                onChange={(value) => setSortMode(value as EstructuraListSortMode)}
                options={[
                  { value: 'name-asc', label: 'A → Z (nombre)' },
                  { value: 'name-desc', label: 'Z → A (nombre)' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredPeople.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {people.length === 0
                ? 'No hay fichas todavía. Pulsa + para crear la primera.'
                : 'No hay fichas con esos filtros.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredPeople.map((person) => {
                const active = selectedPerson?.id === person.id;
                const accessLabel =
                  person.access_profile && person.access_profile !== 'none'
                    ? ACCESS_PROFILE_LABELS[person.access_profile]
                    : null;
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(person.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                          : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                      )}
                    >
                      <EstructuraListPhoto person={person} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {person.full_name}
                          </span>
                          {accessLabel ? (
                            <Badge variant="outline" className="text-[9px]">
                              {accessLabel}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.institutional_role}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <EstructuraDetailPanel
        clubId={clubId}
        person={selectedPerson}
        initialEditOpen={initialEditOpen}
        demoMode={demoMode}
        onDeleted={() => {
          setSelectedId(null);
          router.replace('/portal/club/estructura', { scroll: false });
        }}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <PortalSheetContent maxWidth="2xl">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Nueva ficha institucional</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <InstitutionalPersonForm clubId={clubId} onSaved={handlePersonSaved} />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
