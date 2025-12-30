import { Book, Users, Clock } from '@phosphor-icons/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  title: string;
  description?: string;
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  progress?: number;
  studentsCount?: number;
  lessonsCount?: number;
  onClick?: () => void;
  className?: string;
}

export function CourseCard({
  title,
  description,
  thumbnail,
  status,
  progress,
  studentsCount,
  lessonsCount,
  onClick,
  className,
}: CourseCardProps) {
  const statusConfig = {
    draft: { label: 'Rascunho', variant: 'secondary' as const },
    published: { label: 'Publicado', variant: 'default' as const },
    archived: { label: 'Arquivado', variant: 'outline' as const },
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:border-foreground/20 cursor-pointer animate-fade-in',
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Book className="h-10 w-10 text-muted-foreground/40" weight="regular" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2">{title}</h3>
          {status && (
            <Badge variant={statusConfig[status].variant} className="shrink-0">
              {statusConfig[status].label}
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-1 h-2" />
          </div>
        )}
      </CardContent>
      {(studentsCount !== undefined || lessonsCount !== undefined) && (
        <CardFooter className="border-t px-4 py-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {studentsCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" weight="regular" />
                <span>{studentsCount} alunos</span>
              </div>
            )}
            {lessonsCount !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" weight="regular" />
                <span>{lessonsCount} aulas</span>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
