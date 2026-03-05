
"use client";

import { useState } from "react";
import { generateTrainingPlan, GenerateTrainingPlanInput, GenerateTrainingPlanOutput } from "@/ai/flows/generate-training-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Loader2, Save, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIPlannerPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<GenerateTrainingPlanOutput | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<GenerateTrainingPlanInput>({
    sportType: "",
    athleteRole: "",
    athleteLevel: "intermediate",
    trainingGoal: "",
    durationWeeks: 4,
    sessionsPerWeek: 3,
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateTrainingPlan(formData);
      setPlan(result);
      toast({
        title: "Plan Generado",
        description: "Su programa de entrenamiento táctico está listo.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en Motores",
        description: "No se pudo conectar con el núcleo de IA.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" /> Neural Training Planner
        </h1>
        <p className="text-slate-500">Aprovecha GenAI para diseñar ciclos de entrenamiento en segundos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        <Card className="glass-panel border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Parámetros del Atleta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Deporte</Label>
                <Input 
                  placeholder="ej. Baloncesto" 
                  value={formData.sportType}
                  onChange={e => setFormData({...formData, sportType: e.target.value})}
                  required 
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Rol / Posición</Label>
                <Input 
                  placeholder="ej. Base" 
                  value={formData.athleteRole}
                  onChange={e => setFormData({...formData, athleteRole: e.target.value})}
                  required 
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <Select 
                    value={formData.athleteLevel}
                    onValueChange={(v: any) => setFormData({...formData, athleteLevel: v})}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semanas</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={24} 
                    value={formData.durationWeeks}
                    onChange={e => setFormData({...formData, durationWeeks: parseInt(e.target.value)})}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Objetivo Primario</Label>
                <Input 
                  placeholder="ej. Aumentar salto vertical" 
                  value={formData.trainingGoal}
                  onChange={e => setFormData({...formData, trainingGoal: e.target.value})}
                  required 
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Sesiones / Semana</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={7} 
                  value={formData.sessionsPerWeek}
                  onChange={e => setFormData({...formData, sessionsPerWeek: parseInt(e.target.value)})}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas Adicionales</Label>
                <Textarea 
                  placeholder="Lesiones, preferencias..." 
                  className="min-h-[100px] bg-background/50"
                  value={formData.additionalNotes}
                  onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-primary cyan-glow" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Generar Ciclo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!plan ? (
            <Card className="glass-panel border-dashed border-2 flex flex-col items-center justify-center p-12 h-full text-center">
              <div className="bg-white/5 p-6 rounded-full shadow-sm mb-4">
                <FileText className="h-12 w-12 text-white/20" />
              </div>
              <h3 className="text-xl font-headline font-semibold text-white/40">Módulo Inactivo</h3>
              <p className="text-white/30 max-w-xs mt-2">Complete la configuración para visualizar el programa táctico aquí.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <Card className="glass-panel border-none shadow-md overflow-hidden">
                <div className="bg-primary px-6 py-4 text-primary-foreground">
                  <h2 className="text-2xl font-headline font-bold uppercase">{plan.planTitle}</h2>
                </div>
                <CardContent className="pt-6">
                  <p className="text-white/60 leading-relaxed mb-6 italic">{plan.overview}</p>
                  
                  <div className="space-y-8">
                    {plan.weeklySchedule.map((week) => (
                      <div key={week.weekNumber} className="space-y-4">
                        <h3 className="text-lg font-headline font-bold border-b border-primary/20 pb-2 text-primary flex items-center gap-2">
                          Semana {week.weekNumber} <span className="text-[10px] font-normal text-white/40 uppercase tracking-widest">Fase de Progresión</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {week.sessions.map((session, idx) => (
                            <Card key={idx} className="bg-white/5 border-none">
                              <CardHeader className="py-4">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-bold uppercase text-primary">{session.day}</CardTitle>
                                  <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shadow-sm font-bold uppercase tracking-widest text-primary">{session.focus}</span>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <ul className="text-xs space-y-2">
                                  {session.exercises.map((ex, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                      <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                                      <span className="text-white/80">{ex}</span>
                                    </li>
                                  ))}
                                </ul>
                                {session.notes && (
                                  <p className="text-[10px] text-white/40 mt-2 italic">Nota: {session.notes}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    <h4 className="font-headline font-bold text-white mb-4 flex items-center gap-2">
                      <Save className="h-5 w-5 text-primary" /> Recomendaciones Generales
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.generalRecommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-white/70 bg-black/40 p-3 rounded-xl border border-white/5 shadow-sm">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-black/20 p-6 flex justify-end gap-3">
                  <Button variant="outline" className="rounded-none border-white/10 uppercase text-[10px] tracking-widest">Exportar PDF</Button>
                  <Button className="bg-primary rounded-none px-6 uppercase text-[10px] tracking-widest">Guardar en Perfil</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
