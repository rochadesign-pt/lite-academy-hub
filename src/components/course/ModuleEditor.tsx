import { useState } from 'react';
import {
  CaretDown,
  CaretUp,
  Trash,
  DotsSixVertical,
  ListChecks,
  Plus,
  BookOpen,
  Target,
  Clock,
  Users,
  VideoCamera,
  Link as LinkIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizBuilder } from './QuizBuilder';
import { Module, Resource } from '@/types/course';

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

  const addLearningOutcome = () => {
    const outcomes = module.learning_outcomes || [];
    onChange({ ...module, learning_outcomes: [...outcomes, ''] });
  };

  const updateLearningOutcome = (oIndex: number, value: string) => {
    const outcomes = [...(module.learning_outcomes || [])];
    outcomes[oIndex] = value;
    onChange({ ...module, learning_outcomes: outcomes });
  };

  const removeLearningOutcome = (oIndex: number) => {
    const outcomes = (module.learning_outcomes || []).filter((_, i) => i !== oIndex);
    onChange({ ...module, learning_outcomes: outcomes });
  };

  const addResource = () => {
    const resources = module.resources || [];
    onChange({
      ...module,
      resources: [...resources, { name: '', link: '', license: 'CC BY' }],
    });
  };

  const updateResource = (rIndex: number, field: keyof Resource, value: string) => {
    const resources = [...(module.resources || [])];
    resources[rIndex] = { ...resources[rIndex], [field]: value };
    onChange({ ...module, resources: resources });
  };

  const removeResource = (rIndex: number) => {
    const resources = (module.resources || []).filter((_, i) => i !== rIndex);
    onChange({ ...module, resources: resources });
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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="resources">Recursos</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`module-${index}-code`}>
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Código do Módulo
                    </Label>
                    <Input
                      id={`module-${index}-code`}
                      placeholder="Ex: Digital-01"
                      value={module.module_code || ''}
                      onChange={(e) =>
                        onChange({ ...module, module_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`module-${index}-duration`}>
                      <Clock className="inline h-4 w-4 mr-1" />
                      Duração Estimada
                    </Label>
                    <Input
                      id={`module-${index}-duration`}
                      placeholder="Ex: 8-10 horas"
                      value={module.estimated_duration || ''}
                      onChange={(e) =>
                        onChange({ ...module, estimated_duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-description`}>Descrição / Resumo</Label>
                  <Textarea
                    id={`module-${index}-description`}
                    placeholder="Breve resumo descrevendo o foco e relevância do módulo..."
                    value={module.description || ''}
                    onChange={(e) =>
                      onChange({ ...module, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-abstract`}>Abstract (2-3 frases)</Label>
                  <Textarea
                    id={`module-${index}-abstract`}
                    placeholder="Resumo breve do módulo..."
                    value={module.abstract || ''}
                    onChange={(e) =>
                      onChange({ ...module, abstract: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-content`}>Conteúdo Principal</Label>
                  <Textarea
                    id={`module-${index}-content`}
                    placeholder="Adicione o conteúdo do módulo aqui..."
                    value={module.content || ''}
                    onChange={(e) =>
                      onChange({ ...module, content: e.target.value })
                    }
                    rows={8}
                  />
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-teaser`}>
                    <VideoCamera className="inline h-4 w-4 mr-1" />
                    URL do Vídeo Teaser (30-45 seg)
                  </Label>
                  <Input
                    id={`module-${index}-teaser`}
                    placeholder="https://youtube.com/..."
                    value={module.teaser_video_url || ''}
                    onChange={(e) =>
                      onChange({ ...module, teaser_video_url: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-target`}>
                    <Users className="inline h-4 w-4 mr-1" />
                    Público-Alvo
                  </Label>
                  <Input
                    id={`module-${index}-target`}
                    placeholder="Ex: Professores em formação, educadores..."
                    value={module.target_group || ''}
                    onChange={(e) =>
                      onChange({ ...module, target_group: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      <Target className="inline h-4 w-4 mr-1" />
                      Objetivos de Aprendizagem
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLearningOutcome}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Após completar este módulo, os participantes serão capazes de:
                  </p>
                  <div className="space-y-2">
                    {(module.learning_outcomes || []).map((outcome, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">
                          {oIndex + 1}.
                        </span>
                        <Input
                          placeholder="Objetivo de aprendizagem..."
                          value={outcome}
                          onChange={(e) =>
                            updateLearningOutcome(oIndex, e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLearningOutcome(oIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {(!module.learning_outcomes ||
                      module.learning_outcomes.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum objetivo adicionado ainda.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`module-${index}-reflection`}>
                    Pergunta de Reflexão
                  </Label>
                  <Textarea
                    id={`module-${index}-reflection`}
                    placeholder="Como posso aplicar o que aprendi no meu contexto de ensino?"
                    value={module.reflection_prompt || ''}
                    onChange={(e) =>
                      onChange({ ...module, reflection_prompt: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>
                    <LinkIcon className="inline h-4 w-4 mr-1" />
                    Materiais e Recursos
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addResource}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Recurso
                  </Button>
                </div>

                <div className="space-y-3">
                  {(module.resources || []).map((resource, rIndex) => (
                    <Card key={rIndex} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Nome/Descrição"
                              value={resource.name}
                              onChange={(e) =>
                                updateResource(rIndex, 'name', e.target.value)
                              }
                            />
                            <Input
                              placeholder="Link de acesso"
                              value={resource.link}
                              onChange={(e) =>
                                updateResource(rIndex, 'link', e.target.value)
                              }
                            />
                            <Input
                              placeholder="Licença (CC BY / CC 0)"
                              value={resource.license}
                              onChange={(e) =>
                                updateResource(rIndex, 'license', e.target.value)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResource(rIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!module.resources || module.resources.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <p>Nenhum recurso adicionado ainda.</p>
                      <p className="text-sm">
                        Adicione PDFs, vídeos, podcasts, infográficos, etc.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Quiz Tab */}
              <TabsContent value="quiz" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    <span className="font-medium">Auto-Avaliação / Quiz</span>
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

                {!showQuiz && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <p>Nenhum quiz configurado.</p>
                    <p className="text-sm">
                      Adicione um quiz com perguntas de escolha múltipla para auto-avaliação.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
