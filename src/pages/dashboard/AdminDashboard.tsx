import { Users, BookOpen, UserCheck, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';

const mockUsers = [
  { id: 1, name: 'Maria Santos', email: 'maria@email.com', role: 'teacher', avatar: null },
  { id: 2, name: 'João Silva', email: 'joao@email.com', role: 'student', avatar: null },
  { id: 3, name: 'Ana Costa', email: 'ana@email.com', role: 'student', avatar: null },
  { id: 4, name: 'Pedro Oliveira', email: 'pedro@email.com', role: 'teacher', avatar: null },
  { id: 5, name: 'Sofia Ferreira', email: 'sofia@email.com', role: 'student', avatar: null },
];

const mockCourses = [
  { id: 1, title: 'Inglês para Iniciantes', teacher: 'Maria Santos', students: 45, status: 'published' },
  { id: 2, title: 'Francês Intermediário', teacher: 'Pedro Oliveira', students: 32, status: 'published' },
  { id: 3, title: 'Alemão Básico', teacher: 'Maria Santos', students: 28, status: 'published' },
  { id: 4, title: 'Espanhol Avançado', teacher: 'Pedro Oliveira', students: 0, status: 'draft' },
  { id: 5, title: 'Italiano para Viagens', teacher: 'Maria Santos', students: 22, status: 'published' },
];

const roleLabels = {
  admin: 'Admin',
  teacher: 'Professor',
  student: 'Aluno',
};

const roleVariants = {
  admin: 'destructive' as const,
  teacher: 'default' as const,
  student: 'secondary' as const,
};

export function AdminDashboard() {
  const { profile } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Olá, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma LiTE Academy
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Utilizadores"
          value="1,247"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          description="vs. mês anterior"
        />
        <StatCard
          title="Cursos Publicados"
          value="24"
          icon={BookOpen}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Alunos Inscritos"
          value="892"
          icon={UserCheck}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Taxa de Conclusão"
          value="78%"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Utilizadores Recentes</CardTitle>
            <CardDescription>
              Últimos utilizadores registados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={roleVariants[user.role as keyof typeof roleVariants]}>
                    {roleLabels[user.role as keyof typeof roleLabels]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cursos Populares</CardTitle>
            <CardDescription>
              Cursos com mais alunos inscritos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCourses
                .filter((c) => c.status === 'published')
                .sort((a, b) => b.students - a.students)
                .slice(0, 5)
                .map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          por {course.teacher}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{course.students} alunos</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
