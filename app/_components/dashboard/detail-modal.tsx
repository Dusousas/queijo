import { PropsWithChildren, ReactNode } from "react";

type DetailModalProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  onClose: () => void;
}>;

export function DetailModal({
  title,
  subtitle,
  footer,
  onClose,
  children,
}: DetailModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            x
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
