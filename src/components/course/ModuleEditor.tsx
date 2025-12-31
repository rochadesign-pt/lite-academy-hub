import { useState } from 'react';
import { CaretDown, CaretUp, Trash, DotsSixVertical, ListChecks } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QuizBuilder } from './QuizBuilder';
import { Module } from '@/types/course';

interface ModuleEditorProps {
  module: Module;
  index: number;
  onChange: (module: Module) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ModuleEditor({
  module,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ModuleEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showQuiz, setShowQuiz] = useState(!!module.quiz?.questions?.length);

  const handleQuizToggle = () => {
    if (showQuiz) {
      onChange({ ...module, quiz: undefined });
    } else {
      onChange({
        ...module,
        quiz: {
          title: `Quiz - ${module.title || 'Módulo ' + (index + 1)}`,
          passing_score: 70,
          questions: [],
        },
      });
    }
    setShowQuiz(!showQuiz);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <DotsSixVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                {isOpen ? (
                  <CaretUp className="h-4 w-4" />
                ) : (
                  <CaretDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div className="flex-1">
              <Input
                placeholder={`Título do Módulo ${index + 1}`}
                value={module.title}
                onChange={(e) => onChange({ ...module, title: e.target.value })}
                className="font-medium"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <CaretUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <CaretDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`module-${index}-description`}>Descrição</Label>
              <Textarea
                id={`module-${index}-description`}
                placeholder="Descreva o conteúdo deste módulo..."
                value={module.description || ''}
                onChange={(e) =>
                  onChange({ ...module, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`module-${index}-content`}>Conteúdo</Label>
              <Textarea
                id={`module-${index}-content`}
                placeholder="Adicione o conteúdo do módulo aqui..."
                value={module.content || ''}
                onChange={(e) =>
                  onChange({ ...module, content: e.target.value })
                }
                rows={6}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <span className="font-medium">Quiz do Módulo</span>
                </div>
                <Button
                  type="button"
                  variant={showQuiz ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={handleQuizToggle}
                >
                  {showQuiz ? 'Remover Quiz' : 'Adicionar Quiz'}
                </Button>
              </div>

              {showQuiz && module.quiz && (
                <QuizBuilder
                  questions={module.quiz.questions}
                  onChange={(questions) =>
                    onChange({
                      ...module,
                      quiz: { ...module.quiz!, questions },
                    })
                  }
                  passingScore={module.quiz.passing_score}
                  onPassingScoreChange={(score) =>
                    onChange({
                      ...module,
                      quiz: { ...module.quiz!, passing_score: score },
                    })
                  }
                />
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
