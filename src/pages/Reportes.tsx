import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const barData = [
  { cargo: "Frontend", cantidad: 5 },
  { cargo: "Backend", cantidad: 3 },
  { cargo: "Full Stack", cantidad: 4 },
  { cargo: "Data Analyst", cantidad: 2 },
  { cargo: "UX/UI", cantidad: 3 },
];

const pieData = [
  { name: "Creados", value: 12 },
  { name: "Mejorados", value: 8 },
];

const lineData = [
  { mes: "Ene", cvs: 2 },
  { mes: "Feb", cvs: 3 },
  { mes: "Mar", cvs: 5 },
  { mes: "Abr", cvs: 10 },
];

const COLORS = ["hsl(217, 91%, 50%)", "hsl(168, 72%, 40%)"];

const Reportes = () => {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-1">Estadísticas de tus CVs generados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-primary">20</p>
            <p className="text-sm text-muted-foreground">Total CVs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-accent">12</p>
            <p className="text-sm text-muted-foreground">Creados desde cero</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">8</p>
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="cargo" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipo de CV</CardTitle>
            <CardDescription>Creados vs Mejorados</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolución mensual</CardTitle>
          <CardDescription>CVs generados por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="cvs" stroke="hsl(168, 72%, 40%)" strokeWidth={2} dot={{ fill: "hsl(168, 72%, 40%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
