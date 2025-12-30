import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Clock, Search, Play } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { CourseCard } from '@/components/ui/course-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';

const mockEnrolledCourses = [
  {
    id: '1',
    title: 'Inglês para Iniciantes',
    description: 'Aprenda inglês do zero com aulas práticas e interativas.',
    progress: 65,
    lastAccessed: '2024-01-15',
  },
  {
    id: '2',
    title: 'Francês Básico',
    description: 'Introdução à língua francesa para principiantes.',
    progress: 30,
    lastAccessed: '2024-01-14',
  },
  {
    id: '3',
    title: 'Alemão para Viagens',
    description: 'Aprenda frases essenciais para viajar pela Alemanha.',
    progress: 100,
    lastAccessed: '2024-01-10',
  },
];

export function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const activeCourses = mockEnrolledCourses.filter((c) => c.progress < 100);
  const completedCourses = mockEnrolledCourses.filter((c) => c.progress === 100);
  const lastCourse = activeCourses.sort(
    (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  )[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">
            Olá, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue a sua jornada de aprendizagem
          </p>
        </div>
        <Button onClick={() => navigate('/explore')}>
          <Search className="h-4 w-4" />
          Explorar Cursos
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Cursos em Progresso"
          value={activeCourses.length}
          icon={BookOpen}
        />
        <StatCard
          title="Cursos Concluídos"
          value={completedCourses.length}
          icon={Award}
        />
        <StatCard
          title="Horas de Estudo"
          value="24h"
          icon={Clock}
          description="Este mês"
        />
      </div>

      {lastCourse && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="h-4 w-4" />
              Continuar a Aprender
            </CardTitle>
            <CardDescription>
              Retome de onde parou
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{lastCourse.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lastCourse.description}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{lastCourse.progress}%</span>
                  </div>
                  <Progress value={lastCourse.progress} className="h-2" />
                </div>
              </div>
              <Button onClick={() => navigate(`/courses/${lastCourse.id}`)} className="sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Os Meus Cursos</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-courses')}>
            Ver todos
          </Button>
        </div>

        {mockEnrolledCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Ainda não está inscrito em nenhum curso"
            description="Explore os cursos disponíveis e comece a sua jornada de aprendizagem."
            action={{
              label: 'Explorar Cursos',
              onClick: () => navigate('/explore'),
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                progress={course.progress}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
