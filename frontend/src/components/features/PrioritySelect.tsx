import { Priority } from '../../types/todo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

export function PrioritySelect({
  value,
  onChange,
}: PrioritySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(option.value)}`} />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}
