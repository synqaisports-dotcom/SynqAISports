"use client";

import { useState } from "react";
import { generateNeuralExercise, GenerateExerciseOutput } from "@/ai/flows/generate-neural-exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Target, BookOpen, Layers, Dna } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NeuralExercisesPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState<GenerateExerciseOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    try {
      const result = await generateNeuralExercise({ topic });
      setExercise(result);
      toast({
        title: "SÍNTESIS_COMPLETA",
        description: "Módulo táctico generado por el motor de IA.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALLO_DE_NÚCLEO",
        description: "El motor de IA no pudo procesar la solicitud neuronal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-black flex items-center gap-3 text-white uppercase tracking-tighter">
          <Dna className="h-8 w-8 text-primary" /> Exercise Architect
        </h1>
        <p className="text-white/50 text-[10px] uppercase font-bold tracking-[0.3em]">Generador de módulos tácticos de élite</p>
      </div>

      <div className="max-w-4xl">
        <Card className="glass-panel border-none mb-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader>
            <CardTitle className="text-[10px] tracking-[0.3em] font-black uppercase text-primary">Input de Parámetros Tácticos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Input
                  placeholder="EJ: PRESIÓN TRAS PÉRDIDA 4-3-3..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-none h-14 text-white placeholder:text-white/20 font-bold uppercase"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-primary-foreground font-black rounded-none h-14 px-12 cyan-glow transition-[background-color,border-color,color,opacity,transform] active:scale-95 uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sintetizar Ejercicio"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {exercise && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="glass-panel border-none overflow-hidden relative bg-black/60">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap className="h-48 w-48 text-primary" />
              </div>
              <CardHeader className="border-b border-white/5 bg-primary/5 py-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Módulo_Tactico_Generado</span>
                </div>
                <CardTitle className="text-4xl font-black text-white leading-none uppercase tracking-tighter">{exercise.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Target className="h-5 w-5" />
                      <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Objetivo_Operativo</h3>
                    </div>
                    <p className="text-white/80 leading-relaxed pl-6 border-l border-primary/30 font-medium italic">{exercise.objective}</p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <BookOpen className="h-5 w-5" />
                      <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Descripción_Mecánica</h3>
                    </div>
                    <p className="text-white/70 leading-relaxed pl-6 border-l border-white/10 text-sm">{exercise.description}</p>
                  </section>
                </div>

                <section className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-primary">
                    <Layers className="h-5 w-5" />
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase">Variaciones_de_Progresión</h3>
                  </div>
                  <div className="grid gap-4">
                    {exercise.variations.map((v, i) => (
                      <div key={i} className="bg-white/5 p-6 border border-white/5 flex gap-6 items-center hover:bg-white/10 transition-colors">
                        <span className="text-primary font-black text-2xl opacity-40">0{i + 1}</span>
                        <p className="text-xs text-white/80 font-bold uppercase tracking-wide leading-relaxed">{v}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
