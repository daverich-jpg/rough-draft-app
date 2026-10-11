import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from './cx';
import { Button } from './Button';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Short line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Gentle = sensitive content: no shouty display title, calmer entrance. */
  gentle?: boolean;
  /** Prevent closing via Esc/backdrop (e.g. unsaved journal). Close button still works. */
  dismissible?: boolean;
  className?: string;
};

/**
 * Built on native <dialog>.showModal(): focus is trapped, the page behind is
 * inert, Esc closes, and focus returns to the opener. No focus-trap library needed.
 */
function useDialog(open: boolean, onClose: () => void, dismissible: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (dismissible) onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (dismissible && e.target === d) onClose(); // backdrop click
    };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('click', onClick);
    return () => {
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('click', onClick);
    };
  }, [onClose, dismissible]);
  return ref;
}

function DialogBody({ titleId, descId, title, description, gentle, onClose, children, actions }: DialogProps & { titleId: string; descId: string }) {
  return (
    <>
      <div className="rd-dialog__head">
        <h2 id={titleId} className={gentle ? 'rd-heading-lg' : 'rd-display rd-display-md'}>
          {title}
        </h2>
        <Button variant="ghost" size="sm" icon="close" aria-label="close" onClick={onClose} />
      </div>
      {description && (
        <p id={descId} className="rd-body" style={{ margin: 0 }}>
          {description}
        </p>
      )}
      {children}
      {actions && <div className="rd-dialog__actions">{actions}</div>}
    </>
  );
}

export function Modal(props: DialogProps) {
  const { open, onClose, dismissible = true, description, className } = props;
  const ref = useDialog(open, onClose, dismissible);
  const id = useId();
  return (
    <dialog ref={ref} className={cx('rd-dialog', className)} aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined}>
      {open && (
        <div className="rd-dialog__inner">
          <DialogBody {...props} titleId={`${id}-t`} descId={`${id}-d`} />
        </div>
      )}
    </dialog>
  );
}

/** Bottom sheet on mobile, centred card from 720px up. */
export function Sheet(props: DialogProps) {
  const { open, onClose, dismissible = true, description, className } = props;
  const ref = useDialog(open, onClose, dismissible);
  const id = useId();
  return (
    <dialog ref={ref} className={cx('rd-dialog rd-dialog--sheet', className)} aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined}>
      {open && (
        <div className="rd-dialog__inner">
          <span className="rd-dialog__grab" aria-hidden />
          <DialogBody {...props} titleId={`${id}-t`} descId={`${id}-d`} />
        </div>
      )}
    </dialog>
  );
}
