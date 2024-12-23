import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../hooks/useTodos';
import { useTheme } from '../hooks/useTheme';
import { UserAvatar } from '../components/features/UserAvatar';
import { NotificationBell } from '../components/features/NotificationBell';
import { TaskStats } from '../components/features/TaskStats';
import { DEFAULT_CATEGORIES } from '../components/features/CategoryPicker';
import { BarChart2, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
import { Sun, Moon, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading, signOut, signInWithGoogle } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { todos, loading: todosLoading } = useTodos();

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // Mostra loading enquanto carrega autenticação
  if (authLoading || todosLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não estiver logado, mostra tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Todo App</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <Button onClick={() => signInWithGoogle()}>
          Sign in with Google
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart2 className="h-6 w-6" />
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                  <UserAvatar user={user} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.displayName && (
                      <p className="font-medium">{user.displayName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                  {isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Estatísticas Detalhadas */}
        <div className="grid gap-6">
          <TaskStats todos={todos} categories={DEFAULT_CATEGORIES} />

          {/* Estatísticas Adicionais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Produtividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Média diária</span>
                    <span>{(todos.filter(t => t.completed).length / 7).toFixed(1)} tarefas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Melhor dia</span>
                    <span>Segunda-feira</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Conclusão</span>
                    <span>2.5 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atraso</span>
                    <span>1.2 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEFAULT_CATEGORIES.map(category => (
                    <div key={category.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span>
                        {todos.filter(todo => todo.categoryId === category.id).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
