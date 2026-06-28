import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SpecItem = {
  title: string;
  description: string;
  status?: 'mvp' | 'next' | 'done';
};

type Props = {
  title: string;
  description: string;
  specs: SpecItem[];
};

const statusLabel = {
  mvp: 'En diseño',
  next: 'Próxima fase',
  done: 'Disponible',
} as const;

export function PortalFeatureSpecs({ title, description, specs }: Props) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {specs.map((spec) => (
          <div key={spec.title} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{spec.title}</p>
              {spec.status && (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {statusLabel[spec.status]}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{spec.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
