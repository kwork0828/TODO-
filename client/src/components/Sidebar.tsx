import React, { useState } from 'react';
import { Calendar, LayoutGrid, Hash, RefreshCcw, Inbox, Menu, X, Upload, Download } from 'lucide-react';
import { ICategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  categories: ICategory[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncStatus: { status: string, lastSync: string };
  onForceSync: (dir: 'push' | 'pull') => void;
  isSyncing: boolean;
}

const Sidebar = ({ categories, activeTab, setActiveTab, syncStatus, onForceSync, isSyncing }: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const syncColor =
    syncStatus.status === 'error' ? 'text-red-500' :
    syncStatus.status === 'syncing' ? 'text-blue-500' :
    'text-emerald-500';

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">할</div>
        <h1 className="font-bold text-lg dark:text-white truncate">할일플래너</h1>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 mb-8">
        <button
          onClick={() => handleTabClick('calendar')}
          className={`sidebar-item w-full ${activeTab === 'calendar' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>📅 총 스케쥴</span>
        </button>
        <button
          onClick={() => handleTabClick('inbox')}
          className={`sidebar-item w-full ${activeTab === 'inbox' ? 'active' : ''}`}
        >
          <Inbox size={18} />
          <span>함께보기 (전체)</span>
        </button>
      </nav>

      {/* Categories */}
      <div className="mb-4 flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">카테고리</span>
        </div>
        <div className="space-y-1">
          {categories.filter(c => !c.isArchived).map(category => (
            <button
              key={category.name}
              onClick={() => handleTabClick(category.name)}
              className={`sidebar-item w-full ${activeTab === category.name ? 'active' : ''}`}
            >
              <Hash size={16} className="text-zinc-400 shrink-0" />
              <span className="truncate">{category.name}</span>
            </button>
          ))}
          {categories.filter(c => !c.isArchived).length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-400">
              아직 카테고리가 없습니다.<br />태스크를 추가할 때 생성할 수 있어요.
            </p>
          )}
        </div>
      </div>

      {/* Sync Status Footer */}
      <div className="mt-auto pt-4 border-t border-[#e9e9e7] dark:border-[#2d2d2d]">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold ${syncColor}`}>
              SHEETS {syncStatus.status.toUpperCase()}
            </span>
            <span className="text-[10px] text-zinc-500">
              {syncStatus.lastSync
                ? new Date(syncStatus.lastSync).toLocaleTimeString('ko-KR')
                : '미동기화'}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onForceSync('push')}
              disabled={isSyncing}
              title="구글 시트로 전송"
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-500 disabled:opacity-50 transition-colors"
            >
              <Upload size={14} className={isSyncing ? 'animate-pulse' : ''} />
            </button>
            <button
              onClick={() => onForceSync('pull')}
              disabled={isSyncing}
              title="구글 시트에서 가져오기"
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-500 disabled:opacity-50 transition-colors"
            >
              <Download size={14} className={isSyncing ? 'animate-pulse' : ''} />
            </button>
            <button
              onClick={() => onForceSync('push')}
              disabled={isSyncing}
              title="강제 동기화"
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-[#f7f6f3] dark:bg-[#202020] h-screen border-r border-[#e9e9e7] dark:border-[#2d2d2d] flex-col p-4 shrink-0">
        {nav}
      </aside>

      {/* ── Mobile: hamburger button (shown in TopBar area) ───────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-[#202020] border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm text-zinc-600 dark:text-zinc-300"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile: slide-in drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#f7f6f3] dark:bg-[#202020] border-r border-[#e9e9e7] dark:border-[#2d2d2d] p-4 flex flex-col shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-500"
                aria-label="메뉴 닫기"
              >
                <X size={18} />
              </button>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
