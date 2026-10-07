import type { ReactNode } from 'react';

interface PageHeaderProps {
  chapter: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** The same chapter-and-rule language as the opening landing scene. */
export function PageHeader({ chapter, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <p className="eyebrow"><span>{chapter}</span><span aria-hidden="true" className="eyebrow__rule" />{eyebrow}</p>
        <h1 className="page-heading">{title}</h1>
        {description && <p className="page-subheading">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
