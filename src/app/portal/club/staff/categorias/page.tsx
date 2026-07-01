import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = [
  { name: 'Prebenjamín', teams: 2, staff: 4, medicalOk: 3 },
  { name: 'Benjamín', teams: 3, staff: 6, medicalOk: 5 },
  { name: 'Alevín', teams: 4, staff: 8, medicalOk: 7 },
];

export default function PortalClubStaffCategoriasPage() {
  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Staff por categorías</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club/staff">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{cat.name}</CardTitle>
              <Badge variant="outline">{cat.teams} equipos</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-2xl font-bold">{cat.staff}</p>
                <p className="text-xs text-muted-foreground">Técnicos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{cat.medicalOk}</p>
                <p className="text-xs text-muted-foreground">Médico al día</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
