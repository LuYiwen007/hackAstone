import './ToggleSwitch.css';

export const ToggleSwitch = ({ checked = false, onChange, disabled = false }) => {
  return (
    <button
      className={`toggle-switch ${checked ? 'toggle-switch-checked' : ''} ${disabled ? 'toggle-switch-disabled' : ''}`}
      onClick={() => !disabled && onChange && onChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    >
      <span className="toggle-switch-slider" />
    </button>
  );
};

