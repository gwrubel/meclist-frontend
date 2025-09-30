import './InputCustom.css'

type InputProps = {
    label?: string;
    placeholder?: string;
    value: string;
    type: 'text' | 'number' | 'email' | 'password';
    name: string;
    required?: boolean;
    mask?: 'cpf' | 'phone';
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  

const applyMask = (value: string, mask?: 'cpf' | 'phone'): string => {
  if (!mask) return value;

  const numericValue = value.replace(/\D/g, '');

  if (mask === 'cpf') {
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  if (mask === 'phone') {

    const numericValue = value.replace(/\D/g, '').slice(0, 11); 

    if (numericValue.length <= 10) {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }

  return value;
};

const InputCustom = ({
    label,
    placeholder,
    type,
    name,
    value,
    mask,
    error,
    onChange,
    required
  }: InputProps) => {
      
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const originalValue = e.target.value;
      const maskedValue = mask ? applyMask(originalValue, mask) : originalValue;
  
      const customEvent = {
        target: {
          name: e.target.name,
          value: maskedValue,
        }
      } as React.ChangeEvent<HTMLInputElement>;
  
      onChange(customEvent);
    };
  
    return (
      <div className="input-container">
        {label && <label htmlFor={name}>{label}</label>}
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          id={name}
          value={value}
          onChange={handleInputChange}
          required={required}
        />
        <span className="input-error">{error || '\u00A0'}</span>
      </div>
    );
  };
  

export default InputCustom;
