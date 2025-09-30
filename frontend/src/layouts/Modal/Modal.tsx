import React from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: string;
}

export default function Modal({ isOpen, onClose, children, header }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          {header && <h2>{header}</h2>}
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
