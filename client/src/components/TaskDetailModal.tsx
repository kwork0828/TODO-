import React from 'react';
import { X, Trash2, CheckCircle, Calendar, Hash, Flag, Type, Clock } from 'lucide-react';
import { ITask } from '../../../shared/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  task: ITask;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (task: ITask) => void;
}

const TaskDetailModal = ({ task, onClose, onDelete, onUpdate }: Props) => {
  const isCompleted = task.status === 'completed';

  const priorityColors = {
    urgent: 'text-red-500 border-red-500/20 bg-red-500/5',
    high: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    medium: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    low: 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-[#1c1c1c] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Header Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">태스크 상세 정보</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (confirm('정말로 이 태스크를 삭제하시겠습니까?')) {
                  onDelete(task._id!);
                  onClose();
                }
              }}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="flex items-start gap-4 mb-8">
            <button 
              onClick={() => onUpdate({ ...task, status: isCompleted ? 'pending' : 'completed' })}
              className={`mt-1 p-1 rounded-full transition-all ${isCompleted ? 'text-emerald-500' : 'text-zinc-300 hover:text-emerald-500'}`}
            >
              <CheckCircle size={32} />
            </button>
            <div className="flex-1">
              <h2 className={`text-3xl font-extrabold mb-2 dark:text-white ${isCompleted ? 'text-zinc-400 line-through' : ''}`}>
                {task.title}
              </h2>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400">
                  {task.category}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <Calendar size={18} className="text-zinc-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5 tracking-tight">마감 기한</div>
                  <div className="font-medium">{format(new Date(task.dueDate), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</div>
                </div>
              </div>
              
              {task.startDate && (
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <Clock size={18} className="text-zinc-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5 tracking-tight">시작일</div>
                    <div className="font-medium">{format(new Date(task.startDate), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <Hash size={18} className="text-zinc-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5 tracking-tight">구글 시트 연동</div>
                  <div className="font-medium">{task.category} 탭에 동기화됨</div>
                </div>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="bg-zinc-50 dark:bg-zinc-800/20 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="text-[10px] uppercase font-bold text-zinc-400 mb-3 tracking-tighter">상세 설명</div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
        </div>

        {/* Footer Accent */}
        <div className="px-10 py-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={() => onUpdate({ ...task, status: isCompleted ? 'pending' : 'completed' })}
            className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] ${isCompleted ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
          >
            {isCompleted ? '대기 중으로 변경' : '작성 완료 처리'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetailModal;
