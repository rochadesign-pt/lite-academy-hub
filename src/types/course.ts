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

export interface Module {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  order_index: number;
  quiz?: Quiz;
}

export interface CourseFormData {
  title: string;
  description: string;
  modules: Module[];
}
