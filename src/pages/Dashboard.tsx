import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FilePlus, History, BarChart3, ArrowRight, FileText, TrendingUp } from "lucide-react";
import { cvsApi } from "@/lib/api";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: cvs = [], isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvsApi.list,
  });

  const stats = useMemo(
    () => [
      {
        label: "CVs Generados",
        value: cvs.length.toString(),
        icon: FileText,
        color: "text-primary",
      },
      {
        label: "CVs con IA",
        value: cvs
          .filter((item) => item.currentVersion?.createdByProcess === "ai")
          .length.toString(),
        icon: TrendingUp,
        color: "text-accent",
      },
      {
        label: "Versiones Guardadas",
        value: cvs
          .reduce((total, item) => total + item.versionsCount, 0)
          .toString(),
        icon: History,
        color: "text-warning",
      },
    ],
    [cvs],
  );

  const recentActivity = useMemo(() => cvs.slice(0, 3), [cvs]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido a CVPilot</h1>
        <p className="text-muted-foreground mt-1">
          Crea y mejora tus currículums con inteligencia artificial
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/mejorar-cv")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Mejorar CV existente</CardTitle>
            <CardDescription>
              Sube tu CV actual y obtén una versión optimizada para el cargo que deseas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              Comenzar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-accent/50 transition-colors cursor-pointer" onClick={() => navigate("/crear-cv")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <FilePlus className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>Crear CV desde cero</CardTitle>
            <CardDescription>
              Completa tus datos y la IA generará un CV profesional adaptado al cargo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              Comenzar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Actividad reciente</CardTitle>
            <CardDescription>Tus últimos CVs generados</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/historial")} className="gap-1">
            Ver todo <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading && (
              <div className="text-sm text-muted-foreground">Cargando actividad reciente...</div>
            )}

            {!isLoading && recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.currentVersion?.createdByProcess === "ai" ? "bg-accent" : "bg-primary"}`} />
                  <div>
                    <p className="font-medium text-sm">{item.targetRole}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  {item.currentVersion?.createdByProcess === "ai" ? "IA" : "Manual"}
                </span>
              </div>
            ))}

            {!isLoading && recentActivity.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Todavía no tienes CVs generados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
