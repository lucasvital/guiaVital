import { useTheme } from '../../hooks/useTheme';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
}

export function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme();
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: index === 0 ? '#16a34a' : '#dc2626',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
