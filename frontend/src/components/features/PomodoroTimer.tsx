import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, RotateCcw, Brain, Coffee, Clock } from 'lucide-react';
import { TimerSettingsContext } from '../../contexts/TimerContext';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

type TimerMode = 'focus' | 'break' | 'longBreak';

export function PomodoroTimer() {
  const { settings } = useContext(TimerSettingsContext);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Atualiza o tempo quando as configurações mudam
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getTimeForMode(mode));
    }
  }, [settings.focusTime, settings.breakTime, settings.longBreakTime, mode]);

  // Controla o timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return getTimeForMode(getNextMode());
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const getTimeForMode = (currentMode: TimerMode): number => {
    switch (currentMode) {
      case 'focus':
        return settings.focusTime * 60;
      case 'break':
        return settings.breakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
      default:
        return settings.focusTime * 60;
    }
  };

  const getNextMode = (): TimerMode => {
    if (mode === 'focus') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        setMode('longBreak');
        return 'longBreak';
      }
      setMode('break');
      return 'break';
    }
    setMode('focus');
    return 'focus';
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    const nextMode = getNextMode();
    playNotificationSound();
    
    if (Notification.permission === 'granted') {
      new Notification(
        getNotificationTitle(nextMode),
        { body: getNotificationBody(nextMode) }
      );
    }

    // Auto-start next session if enabled
    if (
      (nextMode === 'focus' && settings.autoStartPomodoros) ||
      ((nextMode === 'break' || nextMode === 'longBreak') && settings.autoStartBreaks)
    ) {
      setTimeout(() => setIsRunning(true), 1000);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(getTimeForMode(mode));
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTimeForMode(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'focus':
        return <Brain className="h-4 w-4" />;
      case 'break':
        return <Clock className="h-4 w-4" />;
      case 'longBreak':
        return <Coffee className="h-4 w-4" />;
    }
  };

  const getModeColor = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'focus':
        return "text-red-500";
      case 'break':
        return "text-green-500";
      case 'longBreak':
        return "text-blue-500";
    }
  };

  const getNotificationTitle = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'Hora de focar!';
      case 'break':
        return 'Hora da pausa!';
      case 'longBreak':
        return 'Hora do café!';
      default:
        return 'Pomodoro Timer';
    }
  };

  const getNotificationBody = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'Vamos voltar ao trabalho?';
      case 'break':
        return 'Faça uma pausa rápida para recarregar as energias.';
      case 'longBreak':
        return 'Você merece um bom café! Aproveite sua pausa longa.';
      default:
        return '';
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.volume = settings.volume / 100;
    audio.play().catch(() => {
      // Falha silenciosa se o navegador bloquear o áudio
    });
  };

  return (
    <div className="flex items-center gap-2 bg-primary-foreground rounded-lg p-2">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {mode === 'focus' ? (
                <Brain className="h-4 w-4 text-primary" />
              ) : mode === 'break' ? (
                <Clock className="h-4 w-4 text-primary" />
              ) : (
                <Coffee className="h-4 w-4 text-primary" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {mode === 'focus' ? 'Tempo de Foco' : mode === 'break' ? 'Pausa Curta' : 'Pausa Longa'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className={cn("font-mono text-lg", getModeColor(mode))}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTimer}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={resetTimer}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
