import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, PlusCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { CourseCard } from '@/components/ui/course-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/lib/auth';

const mockCourses = [
  {
    id: '1',
    title: 'Inglês para Iniciantes',
    description: 'Aprenda inglês do zero com aulas práticas e interativas.',
    status: 'published' as const,
    studentsCount: 45,
    lessonsCount: 12,
  },
  {
    id: '2',
    title: 'Inglês Intermediário',
    description: 'Continue a sua jornada de aprendizagem com conteúdos mais avançados.',
    status: 'published' as const,
    studentsCount: 32,
    lessonsCount: 15,
  },
  {
    id: '3',
    title: 'Conversação em Inglês',
    description: 'Melhore a sua fluência com exercícios de conversação.',
    status: 'draft' as const,
    studentsCount: 0,
    lessonsCount: 8,
  },
];

export function TeacherDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const publishedCourses = mockCourses.filter((c) => c.status === 'published');
  const totalStudents = publishedCourses.reduce((acc, c) => acc + c.studentsCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Olá, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Gerencie os seus cursos e acompanhe o progresso dos alunos
          </p>
        </div>
        <Button onClick={() => navigate('/create-course')} className="sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Novo Curso
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Cursos"
          value={mockCourses.length}
          icon={BookOpen}
        />
        <StatCard
          title="Total de Alunos"
          value={totalStudents}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Taxa Média de Conclusão"
          value="72%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Os Meus Cursos</h2>
          <Button variant="ghost" onClick={() => navigate('/my-courses')}>
            Ver todos
          </Button>
        </div>

        {mockCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum curso criado"
            description="Comece a criar o seu primeiro curso e partilhe o seu conhecimento com os alunos."
            action={{
              label: 'Criar Primeiro Curso',
              onClick: () => navigate('/create-course'),
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                status={course.status}
                studentsCount={course.studentsCount}
                lessonsCount={course.lessonsCount}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
