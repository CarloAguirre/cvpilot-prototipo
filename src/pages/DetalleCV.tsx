import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { cvsApi } from "@/lib/api";
import type { CvDetail } from "@/lib/api/types";

interface FormState {
  title: string;
  targetRole: string;
  jobDescription: string;
  summaryText: string;
  skillsText: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

const emptyForm: FormState = {
  title: "",
  targetRole: "",
  jobDescription: "",
  summaryText: "",
  skillsText: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const buildFormState = (cv: CvDetail): FormState => {
  const currentVersion = cv.currentVersion;
  const currentPersonalDetail = currentVersion?.personalDetail;

  return {
    title: cv.title ?? "",
    targetRole: cv.targetRole,
    jobDescription: currentVersion?.jobDescription ?? "",
    summaryText:
      currentVersion?.summaryText ??
      currentPersonalDetail?.professionalSummary ??
      "",
    skillsText:
      currentVersion?.skillsText ??
      currentVersion?.skills
        .map((versionSkill) => versionSkill.skill?.name)
        .filter((skillName): skillName is string => Boolean(skillName))
        .join(", ") ??
      "",
    fullName: currentPersonalDetail?.fullName ?? "",
    email: currentPersonalDetail?.email ?? "",
    phone: currentPersonalDetail?.phone ?? "",
    location: currentPersonalDetail?.location ?? "",
  };
};

const DetalleCV = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: cv, isLoading, isError } = useQuery({
    queryKey: ["cv", cvId],
    queryFn: () => cvsApi.getOne(cvId as string),
    enabled: Boolean(cvId),
  });

  const baselineForm = useMemo(
    () => (cv ? buildFormState(cv) : emptyForm),
    [cv],
  );

  useEffect(() => {
    if (cv) {
      setForm(buildFormState(cv));
    }
  }, [cv]);

  const manualEditMutation = useMutation({
    mutationFn: () => {
      if (!cvId || !cv?.currentVersion) {
        throw new Error("CV no disponible");
      }

      const normalizedSkills = form.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      return cvsApi.createManualEditedVersion(cvId, {
        title: form.title.trim() || undefined,
        targetRole: form.targetRole.trim() || undefined,
        jobDescription: form.jobDescription.trim() || undefined,
        summaryText: form.summaryText.trim() || undefined,
        skillsText: form.skillsText.trim() || undefined,
        stylePreset: cv.currentVersion.stylePreset,
        personalDetails: {
          fullName: form.fullName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          location: form.location.trim() || undefined,
          professionalSummary: form.summaryText.trim() || undefined,
        },
        skills: normalizedSkills,
      });
    },
    onSuccess: (updatedCv) => {
      queryClient.setQueryData(["cv", cvId], updatedCv);
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      setForm(buildFormState(updatedCv));
      toast({
        title: "Nueva versión guardada",
        description: "Se creó una versión manual con tus cambios y un PDF actualizado.",
      });
    },
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(baselineForm);
  const currentVersion = cv?.currentVersion;

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: "Sin cambios",
        description: "Modifica algún campo antes de guardar una nueva versión.",
      });
      return;
    }

    try {
      await manualEditMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "No fue posible guardar los cambios",
        description:
          error instanceof ApiError
            ? error.message
            : "Inténtalo otra vez en unos segundos.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!currentVersion?.generatedFileUrl) {
      toast({
        title: "PDF no disponible",
        description: "Esta versión todavía no tiene un archivo para descargar.",
      });
      return;
    }

    window.open(currentVersion.generatedFileUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando detalle del CV...</div>;
  }

  if (isError || !cv || !currentVersion) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/historial")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <div className="text-muted-foreground">No fue posible cargar este CV.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Button variant="outline" onClick={() => navigate("/historial")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al historial
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{cv.targetRole}</h1>
          <p className="text-muted-foreground">
            Versión actual #{currentVersion.versionNumber} · Actualizado el {formatDate(cv.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentVersion.createdByProcess === "ai" ? "default" : "secondary"}>
            {currentVersion.createdByProcess === "ai" ? "Generado con IA" : "Edición manual"}
          </Badge>
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Editar versión actual</CardTitle>
            <CardDescription>
              Los cambios crean una nueva versión manual sin perder el historial anterior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(event) => handleFieldChange("title", event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Cargo objetivo</Label>
                <Input value={form.targetRole} onChange={(event) => handleFieldChange("targetRole", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={form.fullName} onChange={(event) => handleFieldChange("fullName", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input type="email" value={form.email} onChange={(event) => handleFieldChange("email", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={(event) => handleFieldChange("phone", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input value={form.location} onChange={(event) => handleFieldChange("location", event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumen profesional</Label>
              <Textarea rows={5} value={form.summaryText} onChange={(event) => handleFieldChange("summaryText", event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Descripción del cargo</Label>
              <Textarea rows={4} value={form.jobDescription} onChange={(event) => handleFieldChange("jobDescription", event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Habilidades</Label>
              <Textarea rows={4} value={form.skillsText} onChange={(event) => handleFieldChange("skillsText", event.target.value)} />
            </div>

            <div className="flex justify-end">
              <Button className="gap-2" onClick={handleSave} disabled={manualEditMutation.isPending || !hasChanges}>
                <Save className="h-4 w-4" />
                {manualEditMutation.isPending ? "Guardando..." : "Guardar nueva versión"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Versión actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Número</span>
                <span className="font-medium">#{currentVersion.versionNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">{currentVersion.versionType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estilo</span>
                <span className="font-medium uppercase">{currentVersion.stylePreset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Proceso</span>
                <span className="font-medium">{currentVersion.createdByProcess}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Versiones totales</span>
                <span className="font-medium">{cv.versions.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiencia</CardTitle>
              <CardDescription>La experiencia y educación se conservan desde la versión actual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentVersion.workExperiences.length ? (
                currentVersion.workExperiences.map((workExperience) => (
                  <div key={workExperience.id} className="space-y-1 rounded-lg border p-3">
                    <p className="font-medium">{workExperience.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">{workExperience.companyName}</p>
                    <p className="text-xs text-muted-foreground">{workExperience.periodLabel}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin experiencia registrada.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Educación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentVersion.educationEntries.length ? (
                currentVersion.educationEntries.map((educationEntry) => (
                  <div key={educationEntry.id} className="space-y-1 rounded-lg border p-3">
                    <p className="font-medium">{educationEntry.degreeTitle}</p>
                    <p className="text-sm text-muted-foreground">{educationEntry.institutionName}</p>
                    <p className="text-xs text-muted-foreground">{educationEntry.periodLabel}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin educación registrada.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetalleCV;