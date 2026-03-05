"use client";

import { useState } from "react";
import { generateNeuralExercise, GenerateExerciseOutput } from "@/ai/flows/generate-neural-exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Zap, Target, BookOpen, Layers } from "lucide-react";
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
        title: "EJERCICIO_SINTETIZADO",
        description: "Módulo táctico generado correctamente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALLO_DE_NÚCLEO",
        description: "No se pudo procesar la solicitud neuronal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" /> Neural Exercise Architect
        </h1>
        <p className="text-white/50">Genera módulos tácticos individuales de alto rendimiento.</p>
      </div>

      <div className="max-w-3xl">
        <Card className="glass-panel border-none mb-8">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.2em]">INPUT_TÁCTICO</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Ej: Presión alta 4-3-3 o Salida desde portería..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-none h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-primary-foreground font-black rounded-none h-12 px-8 cyan-glow"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "GENERAR"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {exercise && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="glass-panel border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-24 w-24 text-primary" />
              </div>
              <CardHeader className="border-b border-white/5 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Módulo_Sintetizado</span>
                </div>
                <CardTitle className="text-2xl font-black text-white">{exercise.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-4 w-4" />
                    <h3 className="text-xs font-black tracking-widest uppercase">Objetivo_Estratégico</h3>
                  </div>
                  <p className="text-white/80 leading-relaxed pl-6 border-l border-primary/20">{exercise.objective}</p>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                    <h3 className="text-xs font-black tracking-widest uppercase">Descripción_Mecánica</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed pl-6 border-l border-white/10">{exercise.description}</p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Layers className="h-4 w-4" />
                    <h3 className="text-xs font-black tracking-widest uppercase">Variaciones_de_Progresión</h3>
                  </div>
                  <div className="grid gap-3 pl-6">
                    {exercise.variations.map((v, i) => (
                      <div key={i} className="bg-black/40 p-4 border border-white/5 flex gap-4 items-start">
                        <span className="text-primary font-black text-[10px]">0{i + 1}</span>
                        <p className="text-xs text-white/60">{v}</p>
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
