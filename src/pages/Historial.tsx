import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { cvsApi } from "@/lib/api";
import type { CvListItem } from "@/lib/api/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getCvTypeLabel = (item: CvListItem) => {
  if (item.currentVersion?.createdByProcess === "ai") {
    return "IA";
  }

  if (item.sourceType === "improved") {
    return "Mejorado";
  }

  if (item.sourceType === "mixed") {
    return "Mixto";
  }

  return "Creado";
};

const Historial = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: cvs = [], isLoading, isError } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvsApi.list,
  });

  const archiveMutation = useMutation({
    mutationFn: ({ cvId, isArchived }: { cvId: string; isArchived: boolean }) =>
      cvsApi.updateArchiveState(cvId, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const filtered = useMemo(
    () =>
      cvs.filter((item) =>
        item.targetRole.toLowerCase().includes(search.toLowerCase()),
      ),
    [cvs, search],
  );

  const handleToggleArchive = async (item: CvListItem) => {
    try {
      await archiveMutation.mutateAsync({
        cvId: item.id,
        isArchived: !item.isArchived,
      });

      toast({
        title: item.isArchived ? "CV restaurado" : "CV archivado",
        description: item.targetRole,
      });
    } catch (error) {
      toast({
        title: "No fue posible actualizar el historial",
        description:
          error instanceof ApiError
            ? error.message
            : "Inténtalo otra vez en unos segundos.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (item: CvListItem) => {
    const generatedFileUrl = item.currentVersion?.generatedFileUrl;

    if (!generatedFileUrl) {
      toast({
        title: "PDF aún no disponible",
        description: "Ese CV todavía no tiene un archivo generado para descargar.",
      });
      return;
    }

    window.open(generatedFileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial de CVs</h1>
        <p className="text-muted-foreground mt-1">Todas las versiones de tus currículums</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cargo..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Cargando historial...
          </div>
        )}

        {!isLoading && isError && (
          <div className="text-center py-12 text-muted-foreground">
            No fue posible cargar el historial.
          </div>
        )}

        {!isLoading && !isError && filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.targetRole}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.updatedAt)} · {item.versionsCount} versión(es)
                    {item.isArchived ? " · Archivado" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.currentVersion?.createdByProcess === "ai" ? "default" : "secondary"}>
                  {getCvTypeLabel(item)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/historial/${item.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleArchive(item)}
                  disabled={archiveMutation.isPending}
                >
                  {item.isArchived ? "Restaurar" : "Archivar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default Historial;
