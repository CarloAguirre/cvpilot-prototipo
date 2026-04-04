import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Sparkles, Shield, History } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CVPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>Iniciar sesión</Button>
            <Button onClick={() => navigate("/registro")}>Registrarse</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Potenciado con Inteligencia Artificial
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Crea el CV perfecto para cada oportunidad
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          CVPilot analiza y genera currículums optimizados para el cargo que deseas, usando inteligencia artificial para destacar tus mejores cualidades.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button size="lg" onClick={() => navigate("/registro")} className="gap-2">
            Comenzar gratis <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            Ya tengo cuenta
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "IA que adapta tu CV",
              desc: "Analiza tu experiencia y destaca lo más relevante para cada cargo específico.",
            },
            {
              icon: Shield,
              title: "Seguro y privado",
              desc: "Tus datos están protegidos. Solo tú tienes acceso a tus currículums.",
            },
            {
              icon: History,
              title: "Historial de versiones",
              desc: "Guarda diferentes versiones de tu CV para distintos cargos y compáralos.",
            },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-card">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 CVPilot — Carlo Aguirre, Lorena Guzmán, Benjamín Vera
        </div>
      </footer>
    </div>
  );
};

export default Index;
