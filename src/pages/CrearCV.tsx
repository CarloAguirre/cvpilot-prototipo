import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, FileText, Plus, Trash2 } from "lucide-react";

interface Experiencia {
  empresa: string;
  cargo: string;
  periodo: string;
  descripcion: string;
}

interface Educacion {
  institucion: string;
  titulo: string;
  periodo: string;
}

const CrearCV = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Datos personales
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [resumen, setResumen] = useState("");

  // Step 2: Experiencia
  const [experiencias, setExperiencias] = useState<Experiencia[]>([
    { empresa: "", cargo: "", periodo: "", descripcion: "" },
  ]);

  // Step 3: Educación y habilidades
  const [educacion, setEducacion] = useState<Educacion[]>([
    { institucion: "", titulo: "", periodo: "" },
  ]);
  const [habilidades, setHabilidades] = useState("");

  // Step 4: Cargo objetivo
  const [cargoObjetivo, setCargoObjetivo] = useState("");

  const totalSteps = 5;
  const stepLabels = ["Datos personales", "Experiencia", "Educación", "Cargo objetivo", "Vista previa"];

  const addExperiencia = () => setExperiencias([...experiencias, { empresa: "", cargo: "", periodo: "", descripcion: "" }]);
  const removeExperiencia = (i: number) => setExperiencias(experiencias.filter((_, idx) => idx !== i));
  const updateExperiencia = (i: number, field: keyof Experiencia, value: string) => {
    const updated = [...experiencias];
    updated[i][field] = value;
    setExperiencias(updated);
  };

  const addEducacion = () => setEducacion([...educacion, { institucion: "", titulo: "", periodo: "" }]);
  const removeEducacion = (i: number) => setEducacion(educacion.filter((_, idx) => idx !== i));
  const updateEducacion = (i: number, field: keyof Educacion, value: string) => {
    const updated = [...educacion];
    updated[i][field] = value;
    setEducacion(updated);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Crear CV desde cero</h1>
        <p className="text-muted-foreground mt-1">Completa tus datos y la IA generará tu CV</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
            </div>
            {s < totalSteps && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{stepLabels[step - 1]}</span>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>Información básica de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input placeholder="Santiago, Chile" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resumen profesional</Label>
              <Textarea placeholder="Breve descripción de tu perfil profesional..." rows={3} value={resumen} onChange={(e) => setResumen(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Experiencia laboral</CardTitle>
            <CardDescription>Agrega tus experiencias más relevantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {experiencias.map((exp, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg border bg-secondary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Experiencia {i + 1}</span>
                  {experiencias.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeExperiencia(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Empresa" value={exp.empresa} onChange={(e) => updateExperiencia(i, "empresa", e.target.value)} />
                  <Input placeholder="Cargo" value={exp.cargo} onChange={(e) => updateExperiencia(i, "cargo", e.target.value)} />
                  <Input placeholder="Período (Ej: 2022 - Presente)" value={exp.periodo} onChange={(e) => updateExperiencia(i, "periodo", e.target.value)} />
                </div>
                <Textarea placeholder="Descripción de responsabilidades..." rows={2} value={exp.descripcion} onChange={(e) => updateExperiencia(i, "descripcion", e.target.value)} />
              </div>
            ))}
            <Button variant="outline" onClick={addExperiencia} className="gap-2 w-full">
              <Plus className="h-4 w-4" /> Agregar experiencia
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Education & Skills */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Educación y habilidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {educacion.map((edu, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg border bg-secondary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Educación {i + 1}</span>
                  {educacion.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeEducacion(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Institución" value={edu.institucion} onChange={(e) => updateEducacion(i, "institucion", e.target.value)} />
                  <Input placeholder="Título obtenido" value={edu.titulo} onChange={(e) => updateEducacion(i, "titulo", e.target.value)} />
                  <Input placeholder="Período" value={edu.periodo} onChange={(e) => updateEducacion(i, "periodo", e.target.value)} />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addEducacion} className="gap-2 w-full">
              <Plus className="h-4 w-4" /> Agregar educación
            </Button>
            <div className="space-y-2">
              <Label>Habilidades</Label>
              <Textarea placeholder="Ej: JavaScript, React, Node.js, SQL, Trabajo en equipo..." rows={3} value={habilidades} onChange={(e) => setHabilidades(e.target.value)} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button onClick={() => setStep(4)} className="gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Target role */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Cargo objetivo</CardTitle>
            <CardDescription>¿Para qué cargo deseas generar tu CV?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo al que postulas</Label>
              <Input placeholder="Ej: Desarrollador Full Stack" value={cargoObjetivo} onChange={(e) => setCargoObjetivo(e.target.value)} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button onClick={() => setStep(5)} disabled={!cargoObjetivo} className="gap-2">
                Generar con IA <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Preview */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa del CV</CardTitle>
            <CardDescription>CV generado por IA para: {cargoObjetivo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-xl p-6 bg-secondary/30 min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Sparkles className="h-12 w-12 text-accent mx-auto" />
                <p className="font-medium">Aquí se mostrará el CV generado</p>
                <p className="text-sm text-muted-foreground">
                  La generación con IA se implementará próximamente
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/historial")}>
                  Guardar en historial
                </Button>
                <Button className="gap-2">
                  Descargar PDF <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrearCV;
