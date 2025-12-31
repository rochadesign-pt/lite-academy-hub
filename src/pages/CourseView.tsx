import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Circle,
  Play,
  ChatCircle,
  PaperPlaneTilt,
  Trash,
  User,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Module {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  completed?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  module_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  status: string;
}

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id, user]);

  useEffect(() => {
    if (selectedModule) {
      fetchComments(selectedModule.id);
    }
  }, [selectedModule]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        navigate('/explore');
        return;
      }

      setCourse(courseData);

      // Fetch teacher name
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', courseData.teacher_id)
        .maybeSingle();

      setTeacherName(teacherProfile?.full_name || 'Professor');

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      if (modulesData && modulesData.length > 0) {
        setSelectedModule(modulesData[0]);
      }

      // Fetch quizzes
      const moduleIds = (modulesData || []).map((m) => m.id);
      if (moduleIds.length > 0) {
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select('*')
          .in('module_id', moduleIds);

        setQuizzes(quizzesData || []);
      }

      // Check enrollment and progress
      if (user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('course_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment || courseData.teacher_id === user.id);

        // Fetch module progress
        const { data: progressData } = await supabase
          .from('module_progress')
          .select('module_id')
          .eq('student_id', user.id)
          .eq('completed', true);

        setCompletedModules(new Set((progressData || []).map((p) => p.module_id)));
      }
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o curso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('module_comments')
        .select('id, content, created_at, user_id')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for comments
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      const commentsWithProfiles = (data || []).map((comment) => ({
        ...comment,
        profiles: { full_name: profileMap.get(comment.user_id) || 'Utilizador' },
      }));

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase.from('course_enrollments').insert({
        course_id: id,
        student_id: user.id,
      });

      if (error) throw error;

      setIsEnrolled(true);
      toast({
        title: 'Sucesso',
        description: 'Inscrição realizada com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível realizar a inscrição.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !selectedModule) return;

    try {
      const { error } = await supabase.from('module_progress').upsert({
        module_id: selectedModule.id,
        student_id: user.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCompletedModules(new Set([...completedModules, selectedModule.id]));
      toast({
        title: 'Módulo concluído!',
        description: 'O seu progresso foi guardado.',
      });

      // Update enrollment progress
      const totalModules = modules.length;
      const completedCount = completedModules.size + 1;
      const progress = Math.round((completedCount / totalModules) * 100);

      await supabase
        .from('course_enrollments')
        .update({ progress })
        .eq('course_id', id)
        .eq('student_id', user.id);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível marcar como concluído.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !selectedModule || !newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { data, error } = await supabase
        .from('module_comments')
        .insert({
          module_id: selectedModule.id,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      setComments([
        ...comments,
        {
          ...data,
          profiles: { full_name: profile?.full_name || 'Utilizador' },
        },
      ]);
      setNewComment('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível publicar o comentário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('module_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível eliminar o comentário.',
        variant: 'destructive',
      });
    }
  };

  const progressPercentage =
    modules.length > 0 ? Math.round((completedModules.size / modules.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso não encontrado.</p>
        <Button asChild className="mt-4">
          <Link to="/explore">Explorar Cursos</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === course.teacher_id;
  const moduleQuiz = selectedModule
    ? quizzes.find((q) => q.module_id === selectedModule.id)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Por {teacherName}</p>
          </div>
        </div>
        {!isOwner && !isEnrolled && (
          <Button onClick={handleEnroll}>Inscrever-me</Button>
        )}
      </div>

      {isEnrolled && (
        <div className="flex items-center gap-4">
          <Progress value={progressPercentage} className="flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {progressPercentage}% completo
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Module List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Módulos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {modules.map((module, index) => {
                const isCompleted = completedModules.has(module.id);
                const isSelected = selectedModule?.id === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        className={`h-5 w-5 flex-shrink-0 ${
                          isSelected ? 'text-primary-foreground' : 'text-green-500'
                        }`}
                        weight="fill"
                      />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 ${
                          isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                    <span className="text-sm font-medium line-clamp-2">
                      {index + 1}. {module.title}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedModule ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedModule.title}</CardTitle>
                      {selectedModule.description && (
                        <CardDescription>{selectedModule.description}</CardDescription>
                      )}
                    </div>
                    {moduleQuiz && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Quiz disponível
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedModule.content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {selectedModule.content}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Este módulo ainda não tem conteúdo.
                    </p>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-3">
                    {isEnrolled && !completedModules.has(selectedModule.id) && (
                      <Button onClick={handleMarkComplete}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como Concluído
                      </Button>
                    )}
                    {moduleQuiz && (
                      <Button variant="outline" asChild>
                        <Link to={`/quiz/${moduleQuiz.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Fazer Quiz
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ChatCircle className="h-4 w-4" />
                    Comentários e Dúvidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && isEnrolled && (
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Escreva a sua dúvida ou comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="icon"
                        className="self-end"
                      >
                        <PaperPlaneTilt className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Ainda não há comentários neste módulo.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comment.profiles?.full_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), "d 'de' MMM, HH:mm", {
                                  locale: pt,
                                })}
                              </span>
                              {(comment.user_id === user?.id || isOwner) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>Este curso ainda não tem módulos.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
