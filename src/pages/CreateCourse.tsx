import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FloppyDisk, ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleEditor } from '@/components/course/ModuleEditor';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseFormData, Module } from '@/types/course';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    modules: [],
  });

  const addModule = () => {
    const newModule: Module = {
      title: '',
      description: '',
      content: '',
      order_index: formData.modules.length,
    };
    setFormData({
      ...formData,
      modules: [...formData.modules, newModule],
    });
  };

  const updateModule = (index: number, updatedModule: Module) => {
    const updated = formData.modules.map((m, i) =>
      i === index ? updatedModule : m
    );
    setFormData({ ...formData, modules: updated });
  };

  const removeModule = (index: number) => {
    const updated = formData.modules
      .filter((_, i) => i !== index)
      .map((m, i) => ({ ...m, order_index: i }));
    setFormData({ ...formData, modules: updated });
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.modules.length) return;

    const updated = [...formData.modules];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((m, i) => (m.order_index = i));
    setFormData({ ...formData, modules: updated });
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Precisa estar autenticado para criar um curso.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título do curso é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          teacher_id: user.id,
          status,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create modules with their quizzes
      for (const module of formData.modules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: course.id,
            title: module.title,
            description: module.description,
            content: module.content,
            order_index: module.order_index,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Create quiz if exists
        if (module.quiz && module.quiz.questions.length > 0) {
          const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .insert({
              module_id: moduleData.id,
              title: module.quiz.title || `Quiz - ${module.title}`,
              description: module.quiz.description,
              passing_score: module.quiz.passing_score,
            })
            .select()
            .single();

          if (quizError) throw quizError;

          // Create quiz questions
          const questions = module.quiz.questions.map((q) => ({
            quiz_id: quizData.id,
            question: q.question,
            options: q.options,
            correct_option: q.correct_option,
            order_index: q.order_index,
          }));

          const { error: questionsError } = await supabase
            .from('quiz_questions')
            .insert(questions);

          if (questionsError) throw questionsError;
        }
      }

      toast({
        title: 'Sucesso',
        description: status === 'published'
          ? 'Curso publicado com sucesso!'
          : 'Rascunho guardado com sucesso!',
      });

      navigate('/my-courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao criar o curso.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Novo Curso</h1>
          <p className="text-muted-foreground">
            Configure os detalhes do curso e adicione módulos com quizzes
          </p>
        </div>
      </div>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso *</Label>
              <Input
                id="title"
                placeholder="Ex: Inglês para Iniciantes"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que os alunos irão aprender..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Módulos</h2>
            <Button type="button" variant="outline" onClick={addModule}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Módulo
            </Button>
          </div>

          {formData.modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Nenhum módulo adicionado ainda.</p>
                <p className="text-sm">
                  Clique em "Adicionar Módulo" para começar a estruturar o seu curso.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {formData.modules.map((module, index) => (
                <ModuleEditor
                  key={index}
                  module={module}
                  index={index}
                  onChange={(updated) => updateModule(index, updated)}
                  onRemove={() => removeModule(index)}
                  onMoveUp={() => moveModule(index, 'up')}
                  onMoveDown={() => moveModule(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === formData.modules.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSubmitting}
          >
            <FloppyDisk className="mr-2 h-4 w-4" />
            Guardar Rascunho
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isSubmitting}
          >
            Publicar Curso
          </Button>
        </div>
      </form>
    </div>
  );
}
