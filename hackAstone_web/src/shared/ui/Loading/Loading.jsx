import './Loading.css';

export const Loading = ({ size = 'medium', className = '' }) => {
  const sizeClass = `loading-${size}`;
  
  return (
    <div className={`loading-wrapper ${className}`.trim()}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

