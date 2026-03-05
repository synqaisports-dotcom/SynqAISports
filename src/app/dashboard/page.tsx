
"use client";

import { useAuth } from "@/lib/auth-context";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Users, 
  Building2, 
  Trophy, 
  TrendingUp,
  BrainCircuit,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const renderSuperAdmin = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">System Overview</h1>
        <p className="text-slate-500">Global control for SynqSports Pro network.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
          <Building2 className="absolute -right-4 -bottom-4 h-24 w-24 opacity-20 rotate-12" />
          <CardHeader>
            <CardTitle className="text-4xl font-headline font-bold">12</CardTitle>
            <CardDescription className="text-white/80">Active Clubs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="font-semibold text-primary" asChild>
              <Link href="/dashboard/superadmin/clubs">Manage Network</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">2,450</CardTitle>
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">$12.4k</CardTitle>
            <CardDescription>MRR Growth</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderClubAdmin = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Club Management</h1>
          <p className="text-slate-500">ID: {profile.clubId}</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20 flex gap-2" asChild>
          <Link href="/dashboard/clubadmin/users"><Plus className="h-4 w-4" /> Invite Staff</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Coaches</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Athletes</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Coach Hub</h1>
          <p className="text-slate-500">Welcome back, Coach.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 text-slate-900 font-bold flex gap-2" asChild>
          <Link href="/dashboard/coach/planner"><BrainCircuit className="h-4 w-4" /> New AI Plan</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white group hover:ring-2 hover:ring-primary/20 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Training Sessions</CardTitle>
            <CardDescription>You have 4 sessions scheduled for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-xl border-slate-200">View Calendar</Button>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white group hover:ring-2 hover:ring-accent/20 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Averages are up 12% across your primary group.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-xl border-slate-200">Full Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTutor = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Athlete Monitoring</h1>
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Athlete Progress</CardTitle>
          <CardDescription>View performance and attendance data for your linked athletes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-2xl p-12 text-center text-slate-400 font-light italic">
            No active metrics for the current period.
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (profile.role) {
    case "superadmin": return renderSuperAdmin();
    case "club_admin": return renderClubAdmin();
    case "coach": return renderCoach();
    case "tutor": return renderTutor();
    default: return <div className="p-8">Access Level Not Defined</div>;
  }
}
