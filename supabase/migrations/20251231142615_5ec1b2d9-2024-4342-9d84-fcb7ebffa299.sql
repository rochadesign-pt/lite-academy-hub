-- Create module_comments table for student discussions
CREATE TABLE public.module_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.module_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on accessible modules
CREATE POLICY "Anyone can view comments on accessible modules"
ON public.module_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = module_comments.module_id
    AND (c.status = 'published' OR c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.module_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = module_comments.module_id
    AND (c.status = 'published' OR c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.module_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments, teachers can delete any in their courses
CREATE POLICY "Users can delete their own comments"
ON public.module_comments
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = module_comments.module_id
    AND (c.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_module_comments_updated_at
BEFORE UPDATE ON public.module_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();