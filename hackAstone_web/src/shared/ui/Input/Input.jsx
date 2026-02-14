import './Input.css';

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`input-wrapper ${className}`.trim()}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input
        id={inputId}
        type={type}
        className={`input ${error ? 'input-error' : ''}`.trim()}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

