import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Transformando o ensino de línguas através da{' '}
              <span className="text-primary">inovação</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Uma iniciativa europeia que capacita professores com ferramentas, estratégias e confiança 
              para ensinar em salas de aula cada vez mais digitais, diversas e multilingues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">120+</div>
              <div className="text-sm text-muted-foreground mt-1">Professores Formados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Taxa de Satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground mt-1">Cursos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">€1.1M</div>
              <div className="text-sm text-muted-foreground mt-1">Financiamento UE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">O que é a LiTE Academy?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Uma plataforma educacional open-source focada em dar autonomia aos professores
              e oferecer uma experiência de aprendizagem intuitiva aos alunos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Cursos Interativos</h3>
              <p className="text-sm text-muted-foreground">
                Conteúdos multimédia e exercícios práticos para uma aprendizagem eficaz.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Comunidade Ativa</h3>
              <p className="text-sm text-muted-foreground">
                Conecte-se com professores e alunos de toda a Europa.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Certificação</h3>
              <p className="text-sm text-muted-foreground">
                Obtenha certificados reconhecidos ao completar os cursos.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multilingue</h3>
              <p className="text-sm text-muted-foreground">
                Plataforma disponível em múltiplos idiomas europeus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 LiTE Academy. Projeto financiado pela União Europeia.
          </p>
        </div>
      </footer>
    </div>
  );
}
