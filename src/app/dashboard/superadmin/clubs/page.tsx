
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const MOCK_CLUBS = [
  { id: "c1", name: "Elite Soccer Academy", plan: "Enterprise", users: 120, status: "Active" },
  { id: "c2", name: "Velocity Basketball", plan: "Pro", users: 45, status: "Active" },
  { id: "c3", name: "AquaSwim Club", plan: "Basic", users: 22, status: "Overdue" },
];

export default function ManageClubsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold">Club Management</h1>
          <p className="text-slate-500">Configure and monitor club instances.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20 flex gap-2">
          <Plus className="h-4 w-4" /> New Club
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b flex flex-row items-center justify-between space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search clubs..." 
              className="pl-10 rounded-xl bg-slate-50 border-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Club Name</TableHead>
                <TableHead className="font-bold">Plan</TableHead>
                <TableHead className="font-bold text-center">Active Users</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CLUBS.map((club) => (
                <TableRow key={club.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-700">{club.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-bold text-[10px] uppercase tracking-wider">
                      {club.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-600">
                    {club.users}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-lg text-[10px] font-bold uppercase",
                      club.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {club.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
