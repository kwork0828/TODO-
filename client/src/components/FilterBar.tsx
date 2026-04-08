import React from 'react';
import { ArrowDownUp, CheckCircle2, Clock } from 'lucide-react';
import { Priority, TaskStatus } from '../types';

interface Props {
  sortBy: string;
  setSortBy: (s: string) => void;
  statusFilter: TaskStatus[];
  setStatusFilter: (s: TaskStatus[]) => void;
  priorityFilter: Priority[];
  setPriorityFilter: (p: Priority[]) => void;
}

const FilterBar = ({ 
  sortBy, 
  setSortBy, 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter 
}: Props) => {
  
  const toggleStatus = (status: TaskStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const togglePriority = (priority: Priority) => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter(p => p !== priority));
    } else {
      setPriorityFilter([...priorityFilter, priority]);
    }
  };

  const statuses: { label: string, value: TaskStatus }[] = [
    { label: '예정', value: 'pending' },
    { label: '진행중', value: 'in-progress' },
    { label: '완료', value: 'completed' },
    { label: '마감초과', value: 'overdue' }
  ];

  const priorities: { label: string, value: Priority }[] = [
    { label: '긴급', value: 'urgent' },
    { label: '높음', value: 'high' },
    { label: '보통', value: 'medium' },
    { label: '낮음', value: 'low' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-6 py-4 px-6 border-b border-[#e9e9e7] dark:border-[#2d2d2d] bg-white dark:bg-[#191919] text-xs">
      {/* Sort By */}
      <div className="flex items-center gap-2">
        <ArrowDownUp size={14} className="text-zinc-400" />
        <span className="font-bold text-zinc-500 uppercase tracking-tighter">정렬</span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent font-medium dark:text-white outline-none cursor-pointer hover:text-blue-500 transition-colors"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="dueSoon">마감임박순</option>
          <option value="priority">우선순위순</option>
        </select>
      </div>

      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

      {/* Filter by Status */}
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} className="text-zinc-400" />
        <span className="font-bold text-zinc-500 uppercase tracking-tighter">상태</span>
        <div className="flex gap-1.5">
          {statuses.map(s => (
            <button 
              key={s.value}
              onClick={() => toggleStatus(s.value)}
              className={`px-2 py-1 rounded-md border transition-all ${statusFilter.includes(s.value) ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500/50 text-blue-600 dark:text-blue-400 font-bold' : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-500 dark:text-zinc-500'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

      {/* Filter by Priority */}
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-zinc-400" />
        <span className="font-bold text-zinc-500 uppercase tracking-tighter">우선순위</span>
        <div className="flex gap-1.5">
          {priorities.map(p => (
            <button 
              key={p.value}
              onClick={() => togglePriority(p.value)}
              className={`px-2 py-1 rounded-md border transition-all ${priorityFilter.includes(p.value) ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500/50 text-orange-600 dark:text-orange-400 font-bold' : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-500 dark:text-zinc-500'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
