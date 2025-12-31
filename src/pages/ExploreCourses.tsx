import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  teacher_id: string;
  teacher_name?: string;
  modules: { count: number }[];
  course_enrollments: { count: number }[];
}

interface Enrollment {
  course_id: string;
}

export default function ExploreCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          created_at,
          teacher_id,
          modules(count),
          course_enrollments(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch teacher names
      const teacherIds = [...new Set((data || []).map(c => c.teacher_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const coursesWithTeachers = (data || []).map(course => ({
        ...course,
        teacher_name: profileMap.get(course.teacher_id) || 'Professor',
      }));

      setCourses(coursesWithTeachers);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os cursos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (error) throw error;
      setEnrolledCourseIds(new Set((data || []).map((e: Enrollment) => e.course_id)));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Precisa estar autenticado para se inscrever.',
        variant: 'destructive',
      });
      return;
    }

    setEnrollingId(courseId);

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: user.id,
        });

      if (error) throw error;

      setEnrolledCourseIds(new Set([...enrolledCourseIds, courseId]));
      toast({
        title: 'Sucesso',
        description: 'Inscrição realizada com sucesso!',
      });
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível realizar a inscrição.',
        variant: 'destructive',
      });
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Explorar Cursos</h1>
        <p className="text-muted-foreground">
          Descubra novos cursos e inscreva-se para começar a aprender
        </p>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar cursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Tente ajustar a sua pesquisa.'
                : 'Novos cursos serão adicionados em breve.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const isOwnCourse = course.teacher_id === user?.id;

            return (
              <Card key={course.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {course.teacher_name || 'Professor'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.modules[0]?.count || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.course_enrollments[0]?.count || 0} alunos</span>
                    </div>
                  </div>

                  {isOwnCourse ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/course/${course.id}`}>
                        Ver Curso
                      </Link>
                    </Button>
                  ) : isEnrolled ? (
                    <Button className="w-full" asChild>
                      <Link to={`/course/${course.id}`}>
                        Continuar
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? 'A inscrever...' : 'Inscrever-me'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
