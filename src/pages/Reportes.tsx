import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { reportsApi } from "@/lib/api";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const COLORS = ["hsl(217, 91%, 50%)", "hsl(168, 72%, 40%)", "hsl(38, 92%, 50%)"];

const formatMonth = (year: number, month: number) => {
  const label = MONTH_LABELS[month - 1] ?? String(month).padStart(2, "0");
  return `${label} ${year}`;
};

const Reportes = () => {
  const { data: snapshot, isLoading, isError } = useQuery({
    queryKey: ["reports", "cv-activity-summary"],
    queryFn: reportsApi.createDatabaseSnapshot,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const payload = snapshot?.payload;
  const barData = (payload?.topTargetRoles ?? []).map((item) => ({
    cargo: item.targetRole,
    cantidad: item.totalVersions,
  }));
  const pieData = [
    { name: "Creados", value: payload?.createdVersions ?? 0 },
    { name: "Mejorados", value: payload?.improvedVersions ?? 0 },
    { name: "Editados", value: payload?.manualEditVersions ?? 0 },
  ].filter((item) => item.value > 0);
  const lineData = (payload?.monthlyVersions ?? []).map((item) => ({
    mes: formatMonth(item.reportYear, item.reportMonth),
    cvs: item.totalVersions,
  }));

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-1">Estadísticas de tus CVs generados</p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-5 text-center text-muted-foreground">Cargando reportes...</CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="p-5 text-center text-destructive">No fue posible cargar los reportes.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-primary">{payload?.totalCvs ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total CVs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-accent">{payload?.createdVersions ?? 0}</p>
            <p className="text-sm text-muted-foreground">Creados desde cero</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">{payload?.improvedVersions ?? 0}</p>
            <p className="text-sm text-muted-foreground">Mejorados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CVs por cargo</CardTitle>
            <CardDescription>Distribución por tipo de cargo</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="cargo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipo de CV</CardTitle>
            <CardDescription>Creados vs Mejorados</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolución mensual</CardTitle>
          <CardDescription>CVs generados por mes</CardDescription>
        </CardHeader>
        <CardContent>
          {lineData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="cvs" stroke="hsl(168, 72%, 40%)" strokeWidth={2} dot={{ fill: "hsl(168, 72%, 40%)" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
