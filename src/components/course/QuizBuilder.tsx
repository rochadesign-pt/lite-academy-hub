import { Plus, Trash, DotsSixVertical } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuizQuestion } from '@/types/course';

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  passingScore: number;
  onPassingScoreChange: (score: number) => void;
}

export function QuizBuilder({
  questions,
  onChange,
  passingScore,
  onPassingScoreChange,
}: QuizBuilderProps) {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct_option: 0,
      order_index: questions.length,
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    onChange(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = questions.map((q, i) => {
      if (i === questionIndex) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order_index: i }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label htmlFor="passing-score">Nota mínima para aprovação (%)</Label>
          <Input
            id="passing-score"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => onPassingScoreChange(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pergunta
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-sm">
          <p>Nenhuma pergunta adicionada ainda.</p>
          <p className="text-sm">Clique em "Adicionar Pergunta" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <DotsSixVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium mb-2">
                      Pergunta {qIndex + 1}
                    </CardTitle>
                    <Input
                      placeholder="Digite a pergunta..."
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(qIndex, { question: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Opções (selecione a resposta correta)
                </Label>
                <RadioGroup
                  value={String(question.correct_option)}
                  onValueChange={(value) =>
                    updateQuestion(qIndex, { correct_option: Number(value) })
                  }
                  className="space-y-2"
                >
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <RadioGroupItem
                        value={String(oIndex)}
                        id={`q${qIndex}-o${oIndex}`}
                      />
                      <Input
                        placeholder={`Opção ${oIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
