
-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_option INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table for students
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create module progress table
CREATE TABLE public.module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- Modules policies
CREATE POLICY "Anyone can view modules of published courses"
ON public.modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND (courses.status = 'published' OR courses.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can create modules for their courses"
ON public.modules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_id 
    AND (courses.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can update modules for their courses"
ON public.modules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND (courses.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can delete modules for their courses"
ON public.modules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND (courses.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Quizzes policies
CREATE POLICY "Anyone can view quizzes of accessible modules"
ON public.quizzes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id
    AND (c.status = 'published' OR c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can manage quizzes"
ON public.quizzes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can update quizzes"
ON public.quizzes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can delete quizzes"
ON public.quizzes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = quizzes.module_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Quiz questions policies
CREATE POLICY "Anyone can view questions of accessible quizzes"
ON public.quiz_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON m.id = q.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE q.id = quiz_questions.quiz_id
    AND (c.status = 'published' OR c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can manage quiz questions"
ON public.quiz_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON m.id = q.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE q.id = quiz_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can update quiz questions"
ON public.quiz_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON m.id = q.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE q.id = quiz_questions.quiz_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Teachers can delete quiz questions"
ON public.quiz_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON m.id = q.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE q.id = quiz_questions.quiz_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Quiz attempts policies
CREATE POLICY "Students can view their own attempts"
ON public.quiz_attempts FOR SELECT
USING (student_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view attempts for their courses"
ON public.quiz_attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON m.id = q.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE q.id = quiz_attempts.quiz_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can submit attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Module progress policies
CREATE POLICY "Students can view their own progress"
ON public.module_progress FOR SELECT
USING (student_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view progress for their courses"
ON public.module_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_progress.module_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can update their own progress"
ON public.module_progress FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update progress"
ON public.module_progress FOR UPDATE
USING (student_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
