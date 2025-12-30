import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeSlash, SpinnerGap, Student, GraduationCap } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['teacher', 'student']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As passwords não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'student' },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <SpinnerGap className="h-8 w-8 animate-spin text-primary" weight="bold" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName, data.role);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Este email já está registado. Tente fazer login.';
      }
      toast({
        title: 'Erro ao criar conta',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Conta criada!',
      description: 'A sua conta foi criada com sucesso.',
    });
    navigate('/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao entrar com Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              {/* Form Section */}
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex flex-col items-center text-center">
                    <Logo size="md" className="mb-4" />
                    <h1 className="text-2xl font-bold">Criar conta</h1>
                    <p className="text-balance text-muted-foreground">
                      Junte-se à LiTE Academy
                    </p>
                  </div>

                  {/* Name Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="O seu nome"
                      {...registerForm.register('fullName')}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                        {...registerForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlash className="h-4 w-4 text-muted-foreground" weight="regular" /> : <Eye className="h-4 w-4 text-muted-foreground" weight="regular" />}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repetir password"
                        className="pr-10"
                        {...registerForm.register('confirmPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeSlash className="h-4 w-4 text-muted-foreground" weight="regular" /> : <Eye className="h-4 w-4 text-muted-foreground" weight="regular" />}
                      </Button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="grid gap-2">
                    <Label>Sou um...</Label>
                    <RadioGroup
                      defaultValue="student"
                      onValueChange={(value) => registerForm.setValue('role', value as 'teacher' | 'student')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                        <Label
                          htmlFor="student"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Student className="h-6 w-6 mb-2" weight="regular" />
                          <span className="font-medium">Aluno</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                        <Label
                          htmlFor="teacher"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <GraduationCap className="h-6 w-6 mb-2" weight="regular" />
                          <span className="font-medium">Professor</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Register Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <SpinnerGap className="mr-2 h-4 w-4 animate-spin" weight="bold" /> : null}
                    Criar conta
                  </Button>

                  {/* Divider */}
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>

                  {/* Google Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue com Google
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center text-sm">
                    Já tem conta?{" "}
                    <Link to="/auth" className="underline underline-offset-4 hover:text-primary">
                      Entrar
                    </Link>
                  </div>
                </div>
              </form>

              {/* Image Section */}
              <div className="relative hidden bg-muted md:block">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Register background"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            Ao criar conta, concorda com os nossos <a href="#">Termos de Serviço</a>{" "}
            e <a href="#">Política de Privacidade</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
