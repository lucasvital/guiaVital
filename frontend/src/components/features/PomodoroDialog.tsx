import { useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Bell, Clock, Coffee, Brain } from 'lucide-react';
import { TimerSettingsContext } from '../../contexts/TimerContext';

interface PomodoroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PomodoroDialog({ open, onOpenChange }: PomodoroDialogProps) {
  const { settings, setSettings } = useContext(TimerSettingsContext);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurar Pomodoro
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Tempo de Foco */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <Label>Tempo de Foco (minutos)</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.focusTime]}
                onValueChange={([value]) => setSettings({ ...settings, focusTime: value })}
                max={60}
                min={1}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.focusTime}
                onChange={(e) => setSettings({ ...settings, focusTime: parseInt(e.target.value) || 25 })}
                className="w-20"
              />
            </div>
          </div>

          {/* Tempo de Pausa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label>Tempo de Pausa (minutos)</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.breakTime]}
                onValueChange={([value]) => setSettings({ ...settings, breakTime: value })}
                max={30}
                min={1}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.breakTime}
                onChange={(e) => setSettings({ ...settings, breakTime: parseInt(e.target.value) || 5 })}
                className="w-20"
              />
            </div>
          </div>

          {/* Tempo de Pausa Longa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <Label>Tempo de Pausa Longa (minutos)</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.longBreakTime]}
                onValueChange={([value]) => setSettings({ ...settings, longBreakTime: value })}
                max={45}
                min={1}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.longBreakTime}
                onChange={(e) => setSettings({ ...settings, longBreakTime: parseInt(e.target.value) || 15 })}
                className="w-20"
              />
            </div>
          </div>

          {/* Intervalo para Pausa Longa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <Label>Intervalo para Pausa Longa (pomodoros)</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.longBreakInterval]}
                onValueChange={([value]) => setSettings({ ...settings, longBreakInterval: value })}
                max={8}
                min={2}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.longBreakInterval}
                onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
                className="w-20"
              />
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <Label>Volume da Notificação</Label>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => setSettings({ ...settings, volume: value })}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Auto Start */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoStartBreaks"
                checked={settings.autoStartBreaks}
                onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
              />
              <Label htmlFor="autoStartBreaks">Iniciar pausas automaticamente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoStartPomodoros"
                checked={settings.autoStartPomodoros}
                onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
              />
              <Label htmlFor="autoStartPomodoros">Iniciar pomodoros automaticamente</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
