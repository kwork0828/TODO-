import { Edit2, Trash2, CheckCircle2, Clock, Inbox } from 'lucide-react'
import axios from 'axios'
import { ITask } from '../types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  tasks: ITask[]
  onEdit: (task: ITask) => void
  onDelete: () => void
  onRefresh: () => void
}

const TaskList = ({ tasks, onEdit, onDelete, onRefresh }: Props) => {
  const handleDelete = async (id?: string) => {
    if (!id) return
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/tasks/${id}`)
        onDelete()
      } catch (e) {
        console.error('Delete failed', e)
      }
    }
  }

  const toggleStatus = async (task: ITask) => {
    if (!task._id) return
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await axios.put(`/api/tasks/${task._id}`, { ...task, status: newStatus })
      onRefresh()
    } catch (e) {
      console.error('Status update failed', e)
    }
  }

  function PriorityBadge({ priority }: { priority: string }) {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    return (
      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${colors[priority]}`}>
        {priority}
      </span>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-white/5 rounded-3xl border border-dashed border-zinc-800">
        <Inbox size={48} className="mb-4 opacity-50" />
        <p className="text-lg">등록된 일정이 없습니다.</p>
        <p className="text-sm">새로운 태스크를 추가해보세요.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <div 
          key={task._id}
          className="glass-card p-5 group flex items-center justify-between hover:bg-white/10 transition-colors animate-fade-in"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleStatus(task)}
              className={`p-1 rounded-full transition-colors ${task.status === 'completed' ? 'text-indigo-500' : 'text-zinc-700 hover:text-zinc-500'}`}
            >
              {task.status === 'completed' ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-current" />}
            </button>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-lg transition-all ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'}`}>
                  {task.title}
                </h3>
                <PriorityBadge priority={task.priority} />
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold">
                  {task.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {format(new Date(task.dueDate), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                </div>
                {task.description && <span className="truncate max-w-[200px]">{task.description}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(task)}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => handleDelete(task._id)}
              className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList
