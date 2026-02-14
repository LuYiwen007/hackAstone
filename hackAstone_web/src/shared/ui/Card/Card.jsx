import './Card.css';

export const Card = ({ 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  const classes = `card ${onClick ? 'card-clickable' : ''} ${className}`.trim();
  
  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

