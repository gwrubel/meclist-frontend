import React from "react";
import './SelectCustom.css'
type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
};

export const SelectCustom: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className = "",
  label
}) => {
  return (
    <div className="select-conatiner">
    {label && <label className="select-label">{label}</label>}
    <select
      className={`select-filtro ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    </div>
  );
};
