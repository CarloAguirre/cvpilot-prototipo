import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { filesApi, improvementsApi } from "@/lib/api";
import type { CvDetail, CvImprovementRequestStatus, ImprovementRequestSummary } from "@/lib/api/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getStatusLabel = (status: CvImprovementRequestStatus) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "processing":
      return "Procesando";
    case "completed":
      return "Completada";
    case "failed":
      return "Fallida";
    default:
      return status;
  }
};

const getStatusVariant = (status: CvImprovementRequestStatus) => {
  switch (status) {
    case "completed":
      return "default" as const;
    case "failed":
      return "destructive" as const;
    case "processing":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const MejorarCV = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [cargo, setCargo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [generatedCv, setGeneratedCv] = useState<CvDetail | null>(null);

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["improvement-requests"],
    queryFn: improvementsApi.list,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setGeneratedCv(null);
    }
  };

  const processImprovementMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Selecciona un archivo antes de continuar");
      }

      if (!cargo.trim()) {
        throw new Error("Indica el cargo objetivo antes de analizar");
      }

      const uploadedFile = await filesApi.upload(file);
      const request = await improvementsApi.create({
        uploadedFileId: uploadedFile.id,
        targetRole: cargo.trim(),
        jobDescription: descripcion.trim() || undefined,
      });

      return improvementsApi.process(request.id);
    },
    onSuccess: (improvedCv) => {
      setGeneratedCv(improvedCv);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      queryClient.invalidateQueries({ queryKey: ["improvement-requests"] });
      toast({
        title: "CV mejorado",
        description: "La vista previa ya refleja la versión optimizada con IA.",
      });
    },
  });

  const retryImprovementMutation = useMutation({
    mutationFn: (requestId: string) => improvementsApi.process(requestId),
    onSuccess: (improvedCv) => {
      setGeneratedCv(improvedCv);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      queryClient.invalidateQueries({ queryKey: ["improvement-requests"] });
      toast({
        title: "Solicitud reprocesada",
        description: "La versión optimizada volvió a generarse correctamente.",
      });
    },
  });

  const currentVersion = generatedCv?.currentVersion;
  const currentPersonalDetail = currentVersion?.personalDetail;
  const previewSkills = useMemo(() => {
    if (!currentVersion) {
      return [];
    }

    if (currentVersion.skills.length) {
      return currentVersion.skills
        .map((versionSkill) => versionSkill.skill?.name)
        .filter((skillName): skillName is string => Boolean(skillName));
    }

    return currentVersion.skillsText
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) ?? [];
  }, [currentVersion]);

  const handleAnalyze = async () => {
    try {
      await processImprovementMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "No fue posible mejorar el CV",
        description:
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Inténtalo otra vez en unos segundos.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = () => {
    if (!currentVersion?.generatedFileUrl) {
      toast({
        title: "PDF no disponible",
        description: "Esta versión todavía no tiene un archivo para descargar.",
      });
      return;
    }

    window.open(currentVersion.generatedFileUrl, "_blank", "noopener,noreferrer");
  };

  const handleProcessExistingRequest = async (request: ImprovementRequestSummary) => {
    try {
      await retryImprovementMutation.mutateAsync(request.id);
    } catch (error) {
      toast({
        title: "No fue posible procesar la solicitud",
        description:
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Inténtalo otra vez en unos segundos.",
        variant: "destructive",
      });
    }
  };

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mejorar CV existente</h1>
        <p className="text-muted-foreground mt-1">
          Sube tu CV y obtén una versión optimizada con IA
        </p>
      </div>

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
              className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5"
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
                  <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX (máx. 5MB)</p>
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
              <Input
                id="cargo"
                placeholder="Ej: Desarrollador Frontend Senior"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
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
              <Button
                onClick={handleAnalyze}
                disabled={!cargo.trim() || !file || processImprovementMutation.isPending}
                className="gap-2"
              >
                {processImprovementMutation.isPending ? "Analizando..." : "Analizar con IA"} <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa del CV mejorado</CardTitle>
            <CardDescription>
              {generatedCv
                ? `Versión optimizada para: ${generatedCv.targetRole}`
                : "Revisa las mejoras sugeridas por la IA"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[300px] rounded-xl border bg-secondary/30 p-6">
              {generatedCv && currentVersion ? (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {currentPersonalDetail?.fullName ?? "Candidato"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {[
                        currentPersonalDetail?.email,
                        currentPersonalDetail?.phone,
                        currentPersonalDetail?.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Resumen profesional
                    </h3>
                    <p className="text-sm leading-6 text-foreground/90">
                      {currentVersion.summaryText ??
                        currentPersonalDetail?.professionalSummary ??
                        "Sin resumen generado todavía."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Experiencia
                    </h3>
                    <div className="space-y-3">
                      {currentVersion.workExperiences.length ? (
                        currentVersion.workExperiences.map((experience) => (
                          <div key={experience.id} className="space-y-1">
                            <p className="font-medium">
                              {experience.jobTitle} · {experience.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground">{experience.periodLabel}</p>
                            {experience.description && (
                              <p className="text-sm text-foreground/90">{experience.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin experiencia detectada.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Educación
                    </h3>
                    <div className="space-y-3">
                      {currentVersion.educationEntries.length ? (
                        currentVersion.educationEntries.map((entry) => (
                          <div key={entry.id} className="space-y-1">
                            <p className="font-medium">{entry.degreeTitle}</p>
                            <p className="text-sm text-foreground/90">{entry.institutionName}</p>
                            <p className="text-xs text-muted-foreground">{entry.periodLabel}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin educación detectada.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Habilidades
                    </h3>
                    {previewSkills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {previewSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border bg-background px-3 py-1 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin habilidades detectadas.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="space-y-3 text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-primary" />
                    <p className="font-medium">Aquí se mostrará el CV mejorado</p>
                    <p className="text-sm text-muted-foreground">
                      Ejecuta el análisis desde el paso anterior para generar la vista previa.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(generatedCv ? `/historial/${generatedCv.id}` : "/historial")}
                >
                  {generatedCv ? "Abrir detalle" : "Ver historial"}
                </Button>
                <Button className="gap-2" onClick={handleDownloadPdf}>
                  Descargar PDF <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Solicitudes recientes</CardTitle>
              <CardDescription>Estado de las últimas mejoras procesadas desde este módulo</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/solicitudes-mejora")}>
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingRequests && (
            <div className="py-6 text-sm text-muted-foreground">Cargando solicitudes recientes...</div>
          )}

          {!isLoadingRequests && recentRequests.length === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              Todavía no hay solicitudes de mejora registradas.
            </div>
          )}

          {!isLoadingRequests && recentRequests.map((request) => {
            const canReprocess = request.status === "pending" || request.status === "failed";

            return (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{request.targetRole}</p>
                    <Badge variant={getStatusVariant(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.uploadedFile?.originalName ?? "Archivo desconocido"} · {formatDate(request.createdAt)}
                  </p>
                  {request.errorMessage && (
                    <p className="text-sm text-destructive">{request.errorMessage}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {request.cv?.id && request.status === "completed" && (
                    <Button variant="outline" onClick={() => navigate(`/historial/${request.cv?.id}`)}>
                      Abrir resultado
                    </Button>
                  )}
                  {canReprocess && (
                    <Button
                      variant="outline"
                      onClick={() => handleProcessExistingRequest(request)}
                      disabled={retryImprovementMutation.isPending}
                    >
                      {request.status === "failed" ? "Reintentar" : "Procesar ahora"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MejorarCV;
