import { AlertCircle, Clock, CalendarDays, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DashboardStatsData {
  total: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completedThisWeek: number;
  completionRateThisWeek: number;
  completionRateLastWeek: number;
  weekOverWeekDelta: number;
}

interface Props {
  stats: DashboardStatsData;
  onOverdueClick: () => void;
}

const DashboardStats = ({ stats, onOverdueClick }: Props) => {
  const delta = stats.weekOverWeekDelta;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-zinc-400';

  const cards = [
    {
      label: '전체 태스크',
      value: stats.total,
      icon: <CalendarDays size={16} className="text-zinc-400" />,
      className: 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: 'text-zinc-900 dark:text-zinc-100',
      clickable: false,
    },
    {
      label: '기한 초과',
      value: stats.overdue,
      icon: <AlertCircle size={16} className="text-red-500" />,
      className: stats.overdue > 0
        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/50'
        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100',
      badge: stats.overdue > 0 ? 'red' : undefined,
      clickable: true,
    },
    {
      label: '오늘 마감',
      value: stats.dueToday,
      icon: <Clock size={16} className="text-yellow-500" />,
      className: stats.dueToday > 0
        ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50'
        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: stats.dueToday > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-900 dark:text-zinc-100',
      badge: stats.dueToday > 0 ? 'yellow' : undefined,
      clickable: false,
    },
    {
      label: '이번 주 마감',
      value: stats.dueThisWeek,
      icon: <CalendarDays size={16} className="text-blue-500" />,
      className: 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: 'text-zinc-900 dark:text-zinc-100',
      clickable: false,
    },
    {
      label: '이번 주 완료',
      value: stats.completedThisWeek,
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      className: 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: 'text-zinc-900 dark:text-zinc-100',
      clickable: false,
    },
    {
      label: '완료율 (이번 주)',
      value: `${stats.completionRateThisWeek}%`,
      icon: <DeltaIcon size={16} className={deltaColor} />,
      className: 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50',
      valueClass: 'text-zinc-900 dark:text-zinc-100',
      sub: delta !== 0 ? `전주 대비 ${delta > 0 ? '+' : ''}${delta}%` : '전주와 동일',
      subClass: deltaColor,
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-6 pb-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={card.clickable ? onOverdueClick : undefined}
          className={`relative rounded-xl border p-3 transition-all ${card.className}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{card.label}</span>
            {card.icon}
          </div>
          <div className={`text-2xl font-bold tracking-tight ${card.valueClass}`}>
            {card.value}
          </div>
          {card.sub && (
            <div className={`text-[10px] mt-0.5 font-medium ${card.subClass}`}>{card.sub}</div>
          )}
          {card.badge === 'red' && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          {card.badge === 'yellow' && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
