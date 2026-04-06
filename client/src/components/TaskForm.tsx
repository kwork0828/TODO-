import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Tag, Flag, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { ITask, ICategory } from '../../../shared/types'

interface Props {
  onClose: () => void
  onSubmit: () => void
  categories: ICategory[]
  editingTask?: ITask
}

const TaskForm = ({ onClose, onSubmit, categories, editingTask }: Props) => {
  const [formData, setFormData] = useState<Partial<ITask>>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(),
    startDate: undefined,
  })

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingTask) {
      setFormData({
        ...editingTask,
        dueDate: new Date(editingTask.dueDate),
        startDate: editingTask.startDate ? new Date(editingTask.startDate) : undefined,
      })
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }))
    }
  }, [editingTask, categories])

  const validate = () => {
    if (!formData.title?.trim()) return '제목을 입력해주세요.'
    if (!formData.dueDate) return '마감 기한을 선택해주세요.'
    if (formData.startDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      return '마감 기한은 시작일보다 빨라야 합니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      if (editingTask?._id) {
        await axios.put(`/api/tasks/${editingTask._id}`, formData)
      } else {
        await axios.post('/api/tasks', formData)
      }
      onSubmit()
      onClose()
    } catch (e: any) {
      setError(e.response?.data?.message || '저장에 실패했습니다.')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { data } = await axios.post('/api/categories', { 
        name: newCategoryName,
        color: '#2383e2', // Default blue
        order: categories.length
      });
      setFormData(prev => ({ ...prev, category: data.name }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      onSubmit(); // Refresh categories in parent
    } catch (e: any) {
      alert('카테고리 생성 실패: ' + e.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        className="relative bg-white dark:bg-[#1c1c1c] w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold dark:text-white">
            {editingTask ? '일정 수정' : '새로운 일정 추가'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">제목</label>
            <input 
              autoFocus
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="무엇을 해야 하나요?"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent focus:border-blue-500/50 rounded-xl px-4 py-3 text-lg font-medium dark:text-white outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">카테고리</label>
              {!isAddingCategory ? (
                <div className="flex gap-2">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-blue-500/50"
                  >
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-xl transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 animate-fade-in">
                  <input 
                    placeholder="새 이름..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-blue-500/50 rounded-xl px-4 py-3 text-sm dark:text-white outline-none"
                  />
                  <button type="button" onClick={handleAddCategory} className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Check size={20} />
                  </button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">우선순위</label>
              <select 
                name="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-blue-500/50"
              >
                <option value="urgent">긴급 (Urgent)</option>
                <option value="high">높음 (High)</option>
                <option value="medium">보통 (Medium)</option>
                <option value="low">낮음 (Low)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">시작일 (선택)</label>
              <input 
                type="datetime-local"
                value={formData.startDate ? new Date(new Date(formData.startDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">마감 기한 (필수)</label>
              <input 
                type="datetime-local"
                value={formData.dueDate ? new Date(new Date(formData.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight ml-1">상세 내용</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="메모나 상세 정보를 입력하세요..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-transparent rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-blue-500/50 resize-none h-32"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 secondary-button !py-4 text-zinc-600 dark:text-zinc-400">취소</button>
            <button type="submit" className="flex-[2] primary-button !py-4 shadow-blue-500/20">
              {editingTask ? '변경 사항 저장' : '태스크 생성'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default TaskForm
