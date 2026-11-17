import { t } from "../i18n";

/** On/off row: label (and optional hint) on the left, a switch on the right. */
export function Toggle({
  label,
  checked,
  disabled,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className={`toggle ${disabled ? "disabled" : ""}`}>
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden>
        <span className="switch-text">{checked ? t("toggle.on") : t("toggle.off")}</span>
      </span>
    </label>
  );
}
