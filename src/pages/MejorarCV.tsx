import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const MejorarCV = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [cargo, setCargo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mejorar CV existente</h1>
        <p className="text-muted-foreground mt-1">
          Sube tu CV y obtén una versión optimizada con IA
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {step === 1 ? "Subir archivo" : step === 2 ? "Cargo objetivo" : "Vista previa"}
        </span>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Sube tu CV actual</CardTitle>
            <CardDescription>Acepta archivos PDF o Word (.docx)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              htmlFor="cv-upload"
              className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX (máx. 5MB)</p>
                </>
              )}
              <input id="cv-upload" type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!file} className="gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>¿A qué cargo postulas?</CardTitle>
            <CardDescription>La IA adaptará tu CV para este cargo específico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo objetivo</Label>
              <Input id="cargo" placeholder="Ej: Desarrollador Frontend Senior" value={cargo} onChange={(e) => setCargo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción del cargo (opcional)</Label>
              <Textarea
                id="desc"
                placeholder="Pega aquí la descripción del puesto para una mejor optimización..."
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button onClick={() => setStep(3)} disabled={!cargo} className="gap-2">
                Analizar con IA <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa del CV mejorado</CardTitle>
            <CardDescription>Revisa las mejoras sugeridas por la IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-xl p-6 bg-secondary/30 min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
                <p className="font-medium">Aquí se mostrará el CV mejorado</p>
                <p className="text-sm text-muted-foreground">
                  La generación con IA se implementará próximamente
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
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

export default MejorarCV;
