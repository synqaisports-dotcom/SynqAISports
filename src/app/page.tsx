
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, LayoutDashboard, BrainCircuit, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">SynqSports Pro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors" href="/login">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-900">
                    Unified Sports Management <span className="text-primary">Evolved.</span>
                  </h1>
                  <p className="max-w-[600px] text-slate-600 md:text-xl font-light leading-relaxed">
                    SynqSports Pro streamlines multi-club administration with AI-driven training plans and secure role-based access control.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-8 shadow-lg shadow-primary/20" asChild>
                    <Link href="/login">Start Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 px-8">
                    View Demo
                  </Button>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <img
                  alt="Athletes Training"
                  className="relative mx-auto aspect-video overflow-hidden rounded-2xl object-cover object-center shadow-2xl transition-all hover:scale-[1.01]"
                  src="https://picsum.photos/seed/sports1/800/600"
                  data-ai-hint="athlete training"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl mb-4">Powerful Features for Modern Clubs</h2>
              <p className="text-slate-500 max-w-[700px] mx-auto">Our modular micro-app architecture ensures every stakeholder has exactly the tools they need.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-sm bg-background/50 hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-3">Multi-Club Security</h3>
                  <p className="text-slate-600 leading-relaxed">Strict clubId-based isolation powered by enterprise-grade Firestore security rules.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-background/50 hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <BrainCircuit className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-3">AI Training Assistant</h3>
                  <p className="text-slate-600 leading-relaxed">Generative AI that creates professional training schedules tailored to athlete roles and sport types.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-background/50 hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-3">Micro-App Dashboards</h3>
                  <p className="text-slate-600 leading-relaxed">Dedicated interfaces for SuperAdmins, Club Admins, Coaches, and Tutors.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 SynqSports Pro. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
