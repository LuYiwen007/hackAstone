import { ToggleSwitch } from '../ToggleSwitch';
import './SettingItem.css';

export const SettingItem = ({ 
  label, 
  value, 
  type = 'text', 
  checked, 
  onChange,
  options = [],
  icon,
  onClick,
  showArrow = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if (type === 'toggle') {
    return (
      <div className="setting-item">
        <span className="setting-item-label">{label}</span>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="setting-item">
        <span className="setting-item-label">{label}</span>
        <select 
          className="setting-item-select"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'link') {
    return (
      <button className="setting-item setting-item-link" onClick={handleClick}>
        <div className="setting-item-link-content">
          {icon && <span className="setting-item-icon">{icon}</span>}
          <span className="setting-item-label">{label}</span>
        </div>
        {showArrow && <span className="setting-item-arrow">›</span>}
      </button>
    );
  }

  return (
    <div className="setting-item">
      <span className="setting-item-label">{label}</span>
      <span className="setting-item-value">{value}</span>
    </div>
  );
};

