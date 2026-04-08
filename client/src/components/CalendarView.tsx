import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { ITask } from '../types'
import { motion } from 'framer-motion'

interface Props {
  tasks: ITask[]
  onEventClick: (task: ITask) => void
}

const CalendarView = ({ tasks, onEventClick }: Props) => {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const events = tasks.map(t => {
    const dueDate = new Date(t.dueDate);
    const isOverdue = dueDate < now && t.status !== 'completed';
    const isCompleted = t.status === 'completed';
    const isApproaching = !isOverdue && !isCompleted && dueDate <= twoDaysFromNow;
    const hasDuration = !!t.startDate;

    let backgroundColor: string;
    let borderColor: string;
    let textColor = '#fff';
    let classNames: string[] = [];

    if (isCompleted) {
      backgroundColor = '#3f3f46'; // zinc-700
      borderColor = 'transparent';
      textColor = '#a1a1aa';
      classNames = ['event-completed'];
    } else if (isOverdue) {
      backgroundColor = '#450a0a'; // very dark red
      borderColor = '#ef4444';
      classNames = ['event-overdue'];
    } else if (isApproaching) {
      backgroundColor = getPriorityColor(t.priority);
      borderColor = '#fbbf24';
      classNames = ['event-approaching'];
    } else {
      backgroundColor = getPriorityColor(t.priority);
      borderColor = 'transparent';
    }

    return {
      id: t._id,
      title: `${isOverdue ? '🚨 ' : isCompleted ? '✅ ' : isApproaching ? '⚠️ ' : ''}${t.title}`,
      start: hasDuration ? t.startDate : t.dueDate,
      end: t.dueDate,
      backgroundColor,
      borderColor,
      textColor,
      classNames,
      extendedProps: { ...t, isOverdue, isCompleted, isApproaching, hasDuration }
    }
  });

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#2383e2'
      case 'low': return '#a1a1a1'
      default: return '#71717a'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#e9e9e7] dark:border-[#2d2d2d] shadow-sm overflow-hidden"
    >
      <style>{`
        /* Approaching deadline: pulsing/glowing border */
        .fc .event-approaching {
          animation: pulse-glow 1.8s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
        }
        @keyframes pulse-glow {
          0%   { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.6); }
          50%  { box-shadow: 0 0 8px 3px rgba(251, 191, 36, 0.3); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }

        /* Overdue: red background, strikethrough text */
        .fc .event-overdue .fc-event-title {
          text-decoration: line-through;
          opacity: 0.9;
        }
        .fc .event-overdue {
          border-left: 3px solid #ef4444 !important;
        }

        /* Completed: muted/grayed */
        .fc .event-completed {
          opacity: 0.55;
          filter: grayscale(30%);
        }
        .fc .event-completed .fc-event-title::after {
          content: ' ✓';
          font-size: 0.75em;
          opacity: 0.7;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={(info: { event: { id: string } }) => {
          const task = tasks.find(t => t._id === info.event.id)
          if (task) onEventClick(task)
        }}
        height="100%"
        editable={false}
        selectable={true}
        locale="ko"
        dayMaxEvents={true}
        buttonText={{
          today: '오늘',
          month: '월',
          week: '주',
          day: '일'
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
        eventDidMount={(info: { event: { title: string; extendedProps: Record<string, any> }; el: HTMLElement }) => {
          const props = info.event.extendedProps;
          // Tooltip
          const lines = [
            `📌 ${info.event.title.replace(/^[🚨✅⚠️] /, '')}`,
            `우선순위: ${props.priority}`,
            `상태: ${props.status}`,
            props.isOverdue ? '⏰ 기한 초과!' : '',
            props.isApproaching ? '⚠️ 마감 임박 (2일 이내)' : '',
          ].filter(Boolean).join('\n');
          info.el.title = lines;
        }}
      />
    </motion.div>
  )
}

export default CalendarView
