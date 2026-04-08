import React from 'react';
import { MoreVertical, CheckCircle2, AlertCircle, Clock, Calendar, ChevronRight } from 'lucide-react';
import { ITask, Priority, TaskStatus } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  task: ITask;
  onClick: (task: ITask) => void;
  onStatusToggle: (task: ITask) => void;
}

const TaskCard = ({ task, onClick, onStatusToggle }: Props) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  const priorityColors = {
    urgent: 'bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/50',
    high: 'bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    medium: 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    low: 'bg-zinc-100/50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800',
  };

  const statusIcons = {
    pending: <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />,
    'in-progress': <Clock size={20} className="text-blue-500 animate-pulse" />,
    completed: <CheckCircle2 size={20} className="text-emerald-500" />,
    overdue: <AlertCircle size={20} className="text-red-500" />,
  };

  return (
    <div 
      onClick={() => onClick(task)}
      className="task-card group flex items-start gap-4 animate-fade-in relative transition-all"
    >
      {/* Status Toggle */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onStatusToggle(task);
        }}
        className="mt-1 transition-transform hover:scale-110 active:scale-95 shrink-0"
      >
        {statusIcons[task.status === 'completed' ? 'completed' : isOverdue ? 'overdue' : task.status]}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold transition-all truncate ${task.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {task.title}
          </h3>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-500">
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
            <Calendar size={12} />
            {format(new Date(task.dueDate), 'MM월 dd일 HH:mm')}
            {isOverdue && <span className="ml-1">(지연!)</span>}
          </div>
          
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: ko })}
          </div>

          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-600">
            {task.category}
          </span>
        </div>
      </div>

      {/* Hover Action Indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-zinc-400">
        <ChevronRight size={18} />
      </div>
    </div>
  );
};

export default TaskCard;
