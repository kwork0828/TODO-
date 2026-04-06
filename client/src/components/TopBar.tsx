import React from 'react';
import { Search, Plus, Moon, Sun, Settings } from 'lucide-react';

interface Props {
  search: string;
  setSearch: (s: string) => void;
  onAddClick: () => void;
  isDarkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

const TopBar = ({ search, setSearch, onAddClick, isDarkMode, setDarkMode }: Props) => {
  return (
    <div className="h-16 pl-14 md:pl-6 pr-6 border-b border-[#e9e9e7] dark:border-[#2d2d2d] flex items-center justify-between bg-white dark:bg-[#191919]">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="제목이나 내용으로 검색..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-blue-500/50 rounded-lg pl-10 pr-4 py-2 text-sm outline-none transition-all placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onAddClick}
          className="primary-button flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">태스크 추가</span>
        </button>
        
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button 
          onClick={() => setDarkMode(!isDarkMode)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-all"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-all">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
