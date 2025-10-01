import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SelectCustom.css";

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
  placeholder?: string;
  ariaLabel?: string;
};

export const SelectCustom: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className = "",
  label,
  placeholder,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mantém referência do item ativo para acessibilidade/scroll
  // const activeOption = useMemo(() => options[activeIndex], [options, activeIndex]);
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  function commitSelection(index: number) {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      commitSelection(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div className={`select-container ${className}`} ref={wrapperRef}>
      {label && (
        <label className="select-label" onClick={() => buttonRef.current?.focus()}>
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={`select-trigger ${open ? "open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="select-value">
          {selectedOption ? selectedOption.label : placeholder || "Selecionar"}
        </span>
        <span aria-hidden className="select-caret">▾</span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="select-popup"
          tabIndex={-1}
          aria-activedescendant={`select-opt-${activeIndex}`}
        >
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const active = idx === activeIndex;
            return (
              <li
                id={`select-opt-${idx}`}
                key={opt.value}
                role="option"
                aria-selected={selected}
                className={`select-option ${selected ? "selected" : ""} ${active ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => commitSelection(idx)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
