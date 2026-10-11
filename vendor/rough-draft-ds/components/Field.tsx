import { createContext, forwardRef, useContext, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';

type FieldCtx = { id: string; describedBy?: string; invalid: boolean };
const Ctx = createContext<FieldCtx | null>(null);

export type FieldProps = {
  label: ReactNode;
  /** Helper text: specific and kind. "only you can see this" beats "optional field". */
  hint?: ReactNode;
  /** Error text. Say what happened and how to fix it. Never blame. */
  error?: ReactNode;
  optional?: boolean;
  /** Hide the label visually (still read by screen readers). Use rarely. */
  hideLabel?: boolean;
  children: ReactNode;
  className?: string;
  /** Rendered after the control, e.g. a character count */
  footer?: ReactNode;
};

/** Wraps any control with label, hint and error, all wired up with aria. */
export function Field({ label, hint, error, optional, hideLabel, children, className, footer }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('rd-field', className)}>
      <label htmlFor={id} className={cx('rd-field__label', hideLabel && 'rd-sr-only')}>
        {label}
        {optional && <span className="rd-field__optional">(optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="rd-field__hint">
          {hint}
        </p>
      )}
      <Ctx.Provider value={{ id, describedBy, invalid: Boolean(error) }}>{children}</Ctx.Provider>
      {error && (
        <p id={errId} className="rd-field__error">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </p>
      )}
      {footer}
    </div>
  );
}

const useField = () => useContext(Ctx);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  const f = useField();
  return (
    <input
      ref={ref}
      id={f?.id}
      aria-describedby={f?.describedBy}
      aria-invalid={f?.invalid || undefined}
      className={cx('rd-input', className)}
      {...rest}
    />
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { lined?: boolean };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, lined, ...rest }, ref) {
  const f = useField();
  return (
    <textarea
      ref={ref}
      id={f?.id}
      aria-describedby={f?.describedBy}
      aria-invalid={f?.invalid || undefined}
      className={cx('rd-textarea', lined && 'rd-lined', className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  const f = useField();
  return (
    <select ref={ref} id={f?.id} aria-describedby={f?.describedBy} aria-invalid={f?.invalid || undefined} className={cx('rd-select', className)} {...rest}>
      {children}
    </select>
  );
});

/** Character counter that announces only near the limit (not every keystroke). */
export function CharCount({ value, max }: { value: string; max: number }) {
  const left = max - value.length;
  return (
    <span className="rd-field__count" aria-live={left <= 20 ? 'polite' : 'off'}>
      {left >= 0 ? `${left} left` : `${-left} over. trim a little?`}
    </span>
  );
}

// ── Checkbox / Radio ─────────────────────────────────────────────────────────
type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode };

export const Checkbox = forwardRef<HTMLInputElement, CheckProps>(function Checkbox({ label, description, className, ...rest }, ref) {
  const id = useId();
  return (
    <label className={cx('rd-check', className)}>
      <input ref={ref} type="checkbox" aria-describedby={description ? `${id}-d` : undefined} {...rest} />
      <span>
        {label}
        {description && (
          <span id={`${id}-d`} className="rd-check__desc">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});

export const Radio = forwardRef<HTMLInputElement, CheckProps>(function Radio({ label, description, className, ...rest }, ref) {
  const id = useId();
  return (
    <label className={cx('rd-check', className)}>
      <input ref={ref} type="radio" aria-describedby={description ? `${id}-d` : undefined} {...rest} />
      <span>
        {label}
        {description && (
          <span id={`${id}-d`} className="rd-check__desc">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});

/** Native radio group: arrow keys, single tab stop, form-friendly. */
export function RadioGroup({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  hideLegend,
}: {
  legend: ReactNode;
  name: string;
  options: Array<{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  hideLegend?: boolean;
}) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  return (
    <fieldset className="rd-fieldset">
      <legend className={cx('rd-field__label', hideLegend && 'rd-sr-only')}>{legend}</legend>
      {options.map((o) => (
        <Radio
          key={o.value}
          name={name}
          value={o.value}
          label={o.label}
          description={o.description}
          disabled={o.disabled}
          checked={current === o.value}
          onChange={() => {
            setInner(o.value);
            onChange?.(o.value);
          }}
        />
      ))}
    </fieldset>
  );
}

// ── Toggle (switch) ──────────────────────────────────────────────────────────
export function Toggle({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  description,
}: {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  description?: ReactNode;
}) {
  const [inner, setInner] = useState(Boolean(defaultChecked));
  const on = checked ?? inner;
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-describedby={description ? `${id}-d` : undefined}
      disabled={disabled}
      className="rd-toggle"
      onClick={() => {
        setInner(!on);
        onChange?.(!on);
      }}
    >
      <span className="rd-toggle__track" aria-hidden>
        <span className="rd-toggle__thumb">{on && <Icon name="check" size={14} strokeWidth={3} />}</span>
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 650 }}>{label}</span>
        {description && (
          <span id={`${id}-d`} className="rd-check__desc">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
