export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_option: number;
  order_index: number;
}

export interface Quiz {
  id?: string;
  title: string;
  description?: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface Resource {
  name: string;
  link: string;
  license: string;
}

export interface SubUnit {
  title: string;
  content: string;
}

export interface LearningActivity {
  type: 'reading' | 'case_study' | 'video' | 'tool_exploration' | 'reflection';
  title: string;
  description: string;
}

export interface Module {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  order_index: number;
  quiz?: Quiz;
  // Template fields from LiTE Academy DIMs
  module_code?: string;
  teaser_video_url?: string;
  abstract?: string;
  learning_outcomes?: string[];
  target_group?: string;
  estimated_duration?: string;
  resources?: Resource[];
  sub_units?: SubUnit[];
  learning_activities?: LearningActivity[];
  reflection_prompt?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  modules: Module[];
}
