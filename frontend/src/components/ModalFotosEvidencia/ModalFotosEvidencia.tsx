import { ImageOff } from "lucide-react";
import Modal from "../../layouts/Modal/Modal";
import Loading from "../Loading/Loading";
import "./ModalFotosEvidencia.css";

export type FotoEvidencia = {
  id: number;
  url: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  nomeItem: string;
  fotos: FotoEvidencia[];
  loading: boolean;
};

export default function ModalFotosEvidencia({
  isOpen,
  onClose,
  nomeItem,
  fotos,
  loading,

}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} header={`Fotos — ${nomeItem}`}>
      {loading ? (
        <div className="modal-fotos-loading">
          <Loading />
        </div>
      ) : fotos.length === 0 ? (
        <div className="modal-fotos-vazio">
          <ImageOff size={40} />
          <p>Nenhuma foto encontrada para este item.</p>
        </div>
      ) : (
        <div className="modal-fotos-grid">
          {fotos.map((foto) => (
          
              <img
                src={foto.url}
                alt={`Foto ${foto.id} de ${nomeItem}`}
                className="modal-fotos-img"
                loading="lazy"
              />
           
          ))}
        </div>
      )}
    </Modal>
  );
}
