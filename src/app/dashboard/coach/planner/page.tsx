
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
        title: "Plan Generated",
        description: "Your custom training plan is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error with the AI engine.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" /> AI Training Planner
        </h1>
        <p className="text-slate-500">Harness GenAI to craft professional schedules in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Input athlete details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Sport Type</Label>
                <Input 
                  placeholder="e.g. Basketball" 
                  value={formData.sportType}
                  onChange={e => setFormData({...formData, sportType: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Athlete Role / Position</Label>
                <Input 
                  placeholder="e.g. Point Guard" 
                  value={formData.athleteRole}
                  onChange={e => setFormData({...formData, athleteRole: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Skill Level</Label>
                  <Select 
                    value={formData.athleteLevel}
                    onValueChange={(v: any) => setFormData({...formData, athleteLevel: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (Weeks)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={24} 
                    value={formData.durationWeeks}
                    onChange={e => setFormData({...formData, durationWeeks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Primary Goal</Label>
                <Input 
                  placeholder="e.g. Increase vertical jump" 
                  value={formData.trainingGoal}
                  onChange={e => setFormData({...formData, trainingGoal: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Sessions per Week</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={7} 
                  value={formData.sessionsPerWeek}
                  onChange={e => setFormData({...formData, sessionsPerWeek: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea 
                  placeholder="Injuries, preferences..." 
                  className="min-h-[100px]"
                  value={formData.additionalNotes}
                  onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!plan ? (
            <Card className="border-none shadow-sm bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center p-12 h-full text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <FileText className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-headline font-semibold text-slate-400">No Plan Generated</h3>
              <p className="text-slate-400 max-w-xs mt-2">Fill out the configuration to see your AI-powered training program here.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="bg-primary px-6 py-4 text-white">
                  <h2 className="text-2xl font-headline font-bold">{plan.planTitle}</h2>
                </div>
                <CardContent className="pt-6">
                  <p className="text-slate-600 leading-relaxed mb-6 italic">{plan.overview}</p>
                  
                  <div className="space-y-8">
                    {plan.weeklySchedule.map((week) => (
                      <div key={week.weekNumber} className="space-y-4">
                        <h3 className="text-lg font-headline font-bold border-b pb-2 text-primary flex items-center gap-2">
                          Week {week.weekNumber} <span className="text-xs font-normal text-slate-400">Progression Phase</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {week.sessions.map((session, idx) => (
                            <Card key={idx} className="bg-slate-50/50 border-none">
                              <CardHeader className="py-4">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm font-bold uppercase text-primary">{session.day}</CardTitle>
                                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border shadow-sm font-bold uppercase tracking-widest text-slate-400">{session.focus}</span>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <ul className="text-xs space-y-2">
                                  {session.exercises.map((ex, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                      <CheckCircle2 className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                                      <span className="text-slate-700">{ex}</span>
                                    </li>
                                  ))}
                                </ul>
                                {session.notes && (
                                  <p className="text-[10px] text-slate-400 mt-2 italic">Note: {session.notes}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 bg-accent/10 rounded-2xl p-6">
                    <h4 className="font-headline font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Save className="h-5 w-5 text-primary" /> General Recommendations
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.generalRecommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-accent/20 shadow-sm">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-6 flex justify-end gap-3">
                  <Button variant="outline" className="rounded-xl">Export PDF</Button>
                  <Button className="bg-primary rounded-xl px-6">Save to Profile</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
