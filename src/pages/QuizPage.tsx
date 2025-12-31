import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  module_id: string;
}

interface QuizAttempt {
  answers: Record<string, number>;
  score: number;
  passed: boolean;
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id, user]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (quizError) throw quizError;
      if (!quizData) {
        toast({
          title: 'Erro',
          description: 'Quiz não encontrado.',
          variant: 'destructive',
        });
        navigate(-1);
        return;
      }

      setQuiz(quizData);

      // Fetch module to get course_id
      const { data: moduleData } = await supabase
        .from('modules')
        .select('course_id')
        .eq('id', quizData.module_id)
        .maybeSingle();

      if (moduleData) {
        setCourseId(moduleData.course_id);
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Parse options from JSON
      const parsedQuestions = (questionsData || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
      }));

      setQuestions(parsedQuestions);

      // Fetch previous attempts
      if (user) {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', id)
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false });

        setPreviousAttempts(attempts || []);
      }
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !quiz) return;

    // Check if all questions are answered
    const unansweredCount = questions.filter((q) => answers[q.id] === undefined).length;
    if (unansweredCount > 0) {
      toast({
        title: 'Atenção',
        description: `Ainda tem ${unansweredCount} pergunta(s) por responder.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_option) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= quiz.passing_score;

      // Save attempt
      const { error } = await supabase.from('quiz_attempts').insert({
        quiz_id: quiz.id,
        student_id: user.id,
        answers: answers,
        score,
        passed,
      });

      if (error) throw error;

      setResult({ answers, score, passed });
      setShowResults(true);

      // If passed, mark module as complete
      if (passed) {
        await supabase.from('module_progress').upsert({
          module_id: quiz.module_id,
          student_id: user.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível submeter o quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz não encontrado ou sem perguntas.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  // Show results screen
  if (showResults && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Resultado do Quiz</h1>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className={`mx-auto mb-4 p-4 rounded-full ${result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {result.passed ? (
                <Trophy className="h-16 w-16 text-green-600 dark:text-green-400" weight="fill" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" weight="fill" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {result.passed ? 'Parabéns!' : 'Não passou'}
            </CardTitle>
            <CardDescription className="text-lg">
              {result.passed
                ? 'Você completou o quiz com sucesso!'
                : `Precisa de pelo menos ${quiz.passing_score}% para passar.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold">{result.score}%</div>
            <p className="text-muted-foreground">
              Acertou {questions.filter((q) => result.answers[q.id] === q.correct_option).length} de {questions.length} perguntas
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {!result.passed && (
                <Button onClick={handleRetry}>
                  Tentar Novamente
                </Button>
              )}
              {courseId && (
                <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
                  Voltar ao Curso
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review answers */}
        <Card>
          <CardHeader>
            <CardTitle>Revisão das Respostas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = result.answers[question.id];
              const isCorrect = userAnswer === question.correct_option;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" weight="fill" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" weight="fill" />
                    )}
                    <div>
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Sua resposta: </span>
                          <span className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {question.options[userAnswer] || 'Não respondida'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="text-muted-foreground">Resposta correta: </span>
                            <span className="text-green-600 dark:text-green-400">
                              {question.options[question.correct_option]}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {currentQuestionIndex + 1} de {questions.length}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Pergunta {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription className="text-base font-medium text-foreground">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) =>
              handleAnswerSelect(currentQuestion.id, parseInt(value))
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:border-primary ${
                  answers[currentQuestion.id] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          {answeredCount} de {questions.length} respondidas
        </span>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'A submeter...' : 'Submeter Quiz'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Próxima
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question navigation dots */}
      <div className="flex justify-center gap-2 flex-wrap">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
              index === currentQuestionIndex
                ? 'bg-primary text-primary-foreground'
                : answers[q.id] !== undefined
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
