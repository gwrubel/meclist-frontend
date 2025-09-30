import './button.css';

interface IButtonProps {
  text: string;
  secondary?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  text,
  secondary,
  onClick,
  icon,
  iconPosition = 'left',
  type,
  disabled,
}: IButtonProps) {
  return (
    <button
      className={secondary ? 'btn-secondary' : 'btn-primary'}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon left">{icon}</span>}
      <span className="btn-text">{text}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon right">{icon}</span>}
    </button>
  );
}

