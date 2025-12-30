import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password é obrigatória'),
});

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

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'student' },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou password incorretos' 
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Bem-vindo!',
      description: 'Login efetuado com sucesso.',
    });
    navigate('/dashboard');
  };

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
    <div className="min-h-screen flex bg-muted/30">
      {/* Left side - Dark image with branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Background image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full w-full p-10">
          {/* Top - Logo and back link */}
          <div className="flex items-center justify-between">
            <Logo size="lg" className="text-white" />
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              ← Voltar ao Website
            </Button>
          </div>
          
          {/* Bottom - Tagline */}
          <div className="mt-auto text-white">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Aprenda Mais.<br />
              Evolua Sempre.<br />
              Cresça Connosco.
            </h1>
            <p className="text-white/70 max-w-md">
              A plataforma de aprendizagem que transforma o seu potencial em conhecimento real.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" />
          </div>

          <Card className="border shadow-lg bg-card">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="space-y-1 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-2">
                <TabsContent value="login" className="space-y-4 mt-0">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Entre na sua conta para continuar a aprender
                    </CardDescription>
                  </div>

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs"
                      onClick={() => navigate('/auth/forgot-password')}
                    >
                      Esqueceu a password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
                      {...loginForm.register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Entrar
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

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
                Google
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-0">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Criar conta</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Junte-se à LiTE Academy e comece a aprender
                </CardDescription>
              </div>

              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      placeholder="O seu nome"
                      className="pl-9"
                      {...registerForm.register('fullName')}
                    />
                  </div>
                  {registerForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      {...registerForm.register('email')}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9 pr-9"
                      {...registerForm.register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repetir password"
                      className="pl-9 pr-9"
                      {...registerForm.register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-3">
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
                        <span className="text-2xl mb-2">📚</span>
                        <span className="font-medium">Aluno</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                      <Label
                        htmlFor="teacher"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-2xl mb-2">🎓</span>
                        <span className="font-medium">Professor</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar Conta
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

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
                Google
              </Button>
            </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ao criar uma conta, aceita os nossos{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Termos de Serviço</a>
            {' '}e{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
