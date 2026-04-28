import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, RefreshCw, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { improvementsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { CvImprovementRequestStatus, ImprovementRequestSummary } from "@/lib/api/types";

type StatusFilter = "all" | CvImprovementRequestStatus;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "processing", label: "Procesando" },
  { value: "completed", label: "Completadas" },
  { value: "failed", label: "Fallidas" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatFileSize = (value: number) => {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

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

const SolicitudesMejora = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ["improvement-requests"],
    queryFn: improvementsApi.list,
  });

  const processRequestMutation = useMutation({
    mutationFn: (requestId: string) => improvementsApi.process(requestId),
    onSuccess: (cvDetail) => {
      queryClient.invalidateQueries({ queryKey: ["improvement-requests"] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      toast({
        title: "Solicitud procesada",
        description: "Se generó una nueva versión optimizada y ya está disponible.",
      });
      navigate(`/historial/${cvDetail.id}`);
    },
    onSettled: () => {
      setActiveRequestId(null);
    },
  });

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" ? true : request.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        request.targetRole,
        request.uploadedFile?.originalName,
        request.cv?.targetRole,
        request.resultCvVersion?.targetRole,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [requests, search, statusFilter]);

  const handleProcessRequest = async (request: ImprovementRequestSummary) => {
    try {
      setActiveRequestId(request.id);
      await processRequestMutation.mutateAsync(request.id);
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

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitudes de mejora</h1>
          <p className="mt-1 text-muted-foreground">
            Revisa el estado de cada solicitud de IA y vuelve a abrir o reprocesar sus resultados.
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/mejorar-cv")}>
          <Sparkles className="h-4 w-4" /> Nueva mejora
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por cargo o nombre del archivo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={statusFilter === filter.value ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            Cargando solicitudes de mejora...
          </div>
        )}

        {!isLoading && isError && (
          <div className="py-12 text-center text-muted-foreground">
            No fue posible cargar las solicitudes de mejora.
          </div>
        )}

        {!isLoading && !isError && filteredRequests.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No hay solicitudes que coincidan con los filtros actuales.
          </div>
        )}

        {!isLoading && !isError && filteredRequests.map((request) => {
          const canProcess =
            request.status === "pending" || request.status === "failed";
          const isProcessingThisRequest =
            processRequestMutation.isPending && activeRequestId === request.id;

          return (
            <Card key={request.id}>
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{request.targetRole}</CardTitle>
                      <Badge variant={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Solicitud #{request.id} · Creada el {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.cv?.id && request.status === "completed" && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/historial/${request.cv?.id}`)}
                      >
                        <Eye className="h-4 w-4" /> Abrir resultado
                      </Button>
                    )}
                    {canProcess && (
                      <Button
                        variant={request.status === "failed" ? "default" : "outline"}
                        className="gap-2"
                        disabled={processRequestMutation.isPending}
                        onClick={() => handleProcessRequest(request)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        {isProcessingThisRequest
                          ? "Procesando..."
                          : request.status === "failed"
                            ? "Reintentar"
                            : "Procesar ahora"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Archivo
                    </p>
                    <p className="font-medium">
                      {request.uploadedFile?.originalName ?? "Archivo desconocido"}
                    </p>
                    {request.uploadedFile && (
                      <p className="text-sm text-muted-foreground">
                        {request.uploadedFile.fileExtension.toUpperCase()} · {formatFileSize(request.uploadedFile.fileSizeBytes)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      CV relacionado
                    </p>
                    <p className="font-medium">
                      {request.cv?.targetRole ?? "Se generará un CV nuevo"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.cv?.title ?? "Sin título asociado todavía"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Resultado
                    </p>
                    <p className="font-medium">
                      {request.resultCvVersion
                        ? `Versión #${request.resultCvVersion.versionNumber}`
                        : "Sin versión generada"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.resultCvVersion?.targetRole ?? "Pendiente de procesamiento"}
                    </p>
                  </div>
                </div>

                {request.jobDescription && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Descripción del cargo
                    </p>
                    <p className="text-sm leading-6 text-foreground/90">{request.jobDescription}</p>
                  </div>
                )}

                {request.errorMessage && (
                  <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{request.errorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SolicitudesMejora;