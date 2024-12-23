import { useMemo } from 'react';
import { Todo } from '../../types/todo';
import { BarChart } from './BarChart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Category } from './CategoryPicker';

interface TaskStatsProps {
  todos: Todo[];
  categories: Category[];
}

export function TaskStats({ todos, categories }: TaskStatsProps) {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Estatísticas por categoria
    const byCategory = categories.map(category => ({
      label: category.name,
      value: todos.filter(todo => todo.categoryId === category.id).length,
      color: category.color,
    }));

    // Estatísticas por dia da semana
    const byWeekday = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - day.getDay() + i);
      return {
        label: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
        value: todos.filter(todo => {
          const todoDate = new Date(todo.createdAt);
          return todoDate.getDay() === i;
        }).length,
      };
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      byCategory,
      byWeekday,
    };
  }, [todos, categories]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Taxa de Conclusão</span>
              <span>{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div>
                <p className="text-slate-500">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={stats.byCategory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={stats.byWeekday} />
        </CardContent>
      </Card>
    </div>
  );
}
