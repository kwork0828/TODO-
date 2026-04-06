import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import FilterBar from './components/FilterBar'
import TaskCard from './components/TaskCard'
import TaskDetailModal from './components/TaskDetailModal'
import TaskForm from './components/TaskForm'
import CalendarView from './components/CalendarView'
import DashboardStats, { DashboardStatsData } from './components/DashboardStats'
import { ITask, ICategory, Priority, TaskStatus } from '../../shared/types'
import { Inbox, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react'

const DEFAULT_STATS: DashboardStatsData = {
  total: 0,
  overdue: 0,
  dueToday: 0,
  dueThisWeek: 0,
  completedThisWeek: 0,
  completionRateThisWeek: 0,
  completionRateLastWeek: 0,
  weekOverWeekDelta: 0,
};

function App() {
  // --- State ---
  const [tasks, setTasks] = useState<ITask[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [activeTab, setActiveTab] = useState<string>('inbox')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [stats, setStats] = useState<DashboardStatsData>(DEFAULT_STATS)

  // Filtering & Sorting State
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('dueSoon')
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null)
  const [editingTask, setEditingTask] = useState<ITask | undefined>(undefined)

  // Loading / Error State
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Sync State
  const [syncStatus, setSyncStatus] = useState({ lastSync: '', status: 'idle' })
  const [isSyncing, setIsSyncing] = useState(false)

  // --- Fetching ---
  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [{ data: tasksData }, { data: catsData }, { data: syncData }, { data: statsData }] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/categories'),
        axios.get('/api/sync/status'),
        axios.get('/api/tasks/stats'),
      ]);
      setTasks(tasksData);
      setCategories(catsData);
      setSyncStatus(syncData);
      setStats(statsData);
      setFetchError(null);
    } catch (e) {
      console.error('Data fetch failed', e);
      if (!silent) setFetchError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000); // silent background refresh
    return () => clearInterval(interval);
  }, []);

  // --- Sync Handlers ---
  const handleForceSync = async (dir: 'push' | 'pull') => {
    setIsSyncing(true);
    try {
      await axios.post(`/api/sync/${dir}`);
      await fetchData();
    } catch (e) {
      alert('동기화 실패: ' + e);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Task CRUD Handlers ---
  const handleUpdateTask = async (task: ITask) => {
    // Optimistic update
    setTasks((prev: ITask[]) => prev.map((t: ITask) => t._id === task._id ? task : t));
    if (selectedTask?._id === task._id) setSelectedTask(task);
    try {
      const { data } = await axios.put(`/api/tasks/${task._id}`, task);
      // Reconcile with server response (e.g. completedDate auto-fill)
      setTasks((prev: ITask[]) => prev.map((t: ITask) => t._id === data._id ? data : t));
      if (selectedTask?._id === data._id) setSelectedTask(data);
    } catch (e) {
      console.error('Task update failed', e);
      fetchData(true); // rollback by re-fetching
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic remove
    setTasks((prev: ITask[]) => prev.filter((t: ITask) => t._id !== id));
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchData(true);
    } catch (e) {
      console.error('Task delete failed', e);
      fetchData(true); // rollback
    }
  };

  // --- Overdue badge click: switch to inbox + filter by overdue ---
  const handleOverdueClick = () => {
    setActiveTab('inbox');
    setStatusFilter(['overdue']);
  };

  // --- Memoized Filtered Tasks ---
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t: ITask) => {
        const matchesCategory = activeTab === 'calendar' || activeTab === 'inbox' || t.category === activeTab;
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                             (t.description?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(t.status);
        const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(t.priority);
        return matchesCategory && matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a: ITask, b: ITask) => {
        if (sortBy === 'newest') return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
        if (sortBy === 'dueSoon') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (sortBy === 'priority') {
          const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        }
        return 0;
      });
  }, [tasks, search, activeTab, statusFilter, priorityFilter, sortBy]);

  const isListView = activeTab !== 'calendar';

  // Initial loading screen
  if (isLoading) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="flex items-center justify-center h-screen bg-white dark:bg-[#191919]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Connection error screen
  if (fetchError) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="flex items-center justify-center h-screen bg-white dark:bg-[#191919]">
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-2xl">🔌</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">연결할 수 없습니다</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">{fetchError}</p>
            <button onClick={() => fetchData()} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} flex h-screen overflow-hidden`}>
      <Sidebar
        categories={categories}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncStatus={syncStatus}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#191919]">
        <TopBar
          search={search}
          setSearch={setSearch}
          onAddClick={() => {
            setEditingTask(undefined);
            setIsFormOpen(true);
          }}
          isDarkMode={isDarkMode}
          setDarkMode={setIsDarkMode}
        />

        {/* Dashboard stats — shown in all list views */}
        {isListView && (
          <DashboardStats stats={stats} onOverdueClick={handleOverdueClick} />
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'calendar' ? (
            <div className="p-6 h-full">
              <CalendarView tasks={tasks} onEventClick={setSelectedTask} />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto py-2">
              <FilterBar
                sortBy={sortBy} setSortBy={setSortBy}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
              />

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    {activeTab === 'inbox' ? <LayoutGrid size={20} /> : <Hash size={20} />}
                    {activeTab === 'inbox' ? '모든 태스크' : activeTab}
                    <span className="text-sm font-normal text-zinc-400 ml-2">{filteredTasks.length}개의 항목</span>
                  </h2>
                  {statusFilter.includes('overdue') && (
                    <button
                      onClick={() => setStatusFilter([])}
                      className="text-xs text-red-500 hover:text-red-400 underline"
                    >
                      필터 해제
                    </button>
                  )}
                </div>

                {filteredTasks.length > 0 ? (
                  <div className="grid gap-3">
                    {filteredTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onClick={setSelectedTask}
                        onStatusToggle={handleUpdateTask}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p>표시할 태스크가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={fetchData}
            categories={categories}
            editingTask={editingTask}
          />
        )}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const Hash = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
);

export default App
