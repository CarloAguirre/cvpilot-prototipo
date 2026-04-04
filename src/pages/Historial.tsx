import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Trash2, Search } from "lucide-react";

const mockHistory = [
  { id: 1, cargo: "Desarrollador Frontend", fecha: "02 Abr 2026", tipo: "Creado", versiones: 3 },
  { id: 2, cargo: "Analista de Datos", fecha: "28 Mar 2026", tipo: "Mejorado", versiones: 2 },
  { id: 3, cargo: "Ingeniero de Software", fecha: "25 Mar 2026", tipo: "Creado", versiones: 1 },
  { id: 4, cargo: "Product Manager", fecha: "20 Mar 2026", tipo: "Mejorado", versiones: 4 },
  { id: 5, cargo: "Diseñador UX/UI", fecha: "15 Mar 2026", tipo: "Creado", versiones: 2 },
  { id: 6, cargo: "DevOps Engineer", fecha: "10 Mar 2026", tipo: "Mejorado", versiones: 1 },
];

const Historial = () => {
  const [search, setSearch] = useState("");
  const filtered = mockHistory.filter((item) =>
    item.cargo.toLowerCase().includes(search.toLowerCase())
  );

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
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.cargo}</p>
                  <p className="text-sm text-muted-foreground">{item.fecha} · {item.versiones} versión(es)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.tipo === "Creado" ? "default" : "secondary"}>
                  {item.tipo}
                </Badge>
                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default Historial;
