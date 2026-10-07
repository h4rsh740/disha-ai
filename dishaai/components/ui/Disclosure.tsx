'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclosureProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 2 | 3;
  className?: string;
}

/** Supporting content stays available without making the default page long. */
export function Disclosure({ title, description, icon, children, defaultOpen = false, headingLevel = 2, className }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const titleId = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <section className={cn('paper-panel min-w-0', className)}>
      <Heading>
        <button
          id={titleId}
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
          className="ui-disclosure-toggle flex min-h-11 w-full items-center gap-3 rounded-sm px-4 py-3 text-left transition-colors hover:bg-[var(--ui-surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--ui-accent)] focus-visible:outline-offset-2"
        >
          {icon && <span className="shrink-0 text-[var(--ui-accent)]" aria-hidden="true">{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-xl font-normal leading-tight text-[var(--ui-text)] [overflow-wrap:anywhere]">{title}</span>
            {description && <span className="mt-1 block text-xs font-normal leading-relaxed text-[var(--ui-muted)]">{description}</span>}
          </span>
          <ChevronDown size={16} aria-hidden="true" className={cn('shrink-0 text-[var(--ui-faint)] print:hidden', open && 'rotate-180')} />
        </button>
      </Heading>
      <div id={contentId} role="region" aria-labelledby={titleId} hidden={!open} className="ui-disclosure-content px-4 pb-4">
        <div className="border-t border-[var(--ui-border)] pt-3">{children}</div>
      </div>
    </section>
  );
}
