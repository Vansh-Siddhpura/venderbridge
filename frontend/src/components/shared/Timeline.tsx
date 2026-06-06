import React from 'react';
import { formatDateTime } from '@/utils/formatters';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string | Date;
  user: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return <div className="text-center text-sm text-muted p-4">No events logged.</div>;
  }

  return (
    <div className="relative border-l border-default ml-3 pl-6 space-y-6">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Vertical Node Indicator */}
          <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-surface group-hover:bg-primary-light transition-colors">
            {event.icon ? (
              <span className="text-[10px] text-primary">{event.icon}</span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </span>
          {/* Event Content */}
          <div className="bg-surface border border-default p-4 rounded-lg shadow-sm hover:border-hover hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
              <span className="text-sm font-semibold text-primary">
                {event.title}
              </span>
              <span className="text-xs text-muted">
                {formatDateTime(event.timestamp)}
              </span>
            </div>
            <p className="text-xs text-primary mb-2 leading-relaxed">
              {event.description}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                By:
              </span>
              <span className="text-xs font-semibold text-primary">
                {event.user}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
