import React from 'react';
import { formatDateTime } from '@/utils/formatters';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: React.ReactNode;
  timestamp: string | Date;
  user?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="card card__body text-center text-sm text-muted">
        No events yet.
      </div>
    );
  }

  return (
    <div className="relative ml-3 space-y-5 border-l border-default pl-6">
      {events.map((event) => (
        <div key={event.id} className="relative">
          <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-default bg-surface text-brand">
            {event.icon ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <div className="card card__body">
            <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-primary">{event.title}</span>
              <span className="text-xs text-muted">{formatDateTime(event.timestamp)}</span>
            </div>
            {event.description && (
              <div className="text-sm leading-relaxed text-secondary">
                {event.description}
              </div>
            )}
            {event.user && (
              <div className="mt-2 text-xs text-muted">
                by <span className="font-medium text-secondary">{event.user}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
