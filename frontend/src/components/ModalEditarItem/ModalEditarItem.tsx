import { useState, useEffect } from "react";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { CategoriaParteVeiculo, tItem } from "../../types/Item";
import "./ModalEditarItem.css";
import { SelectCustom } from "../Select/SelectCustom";
import { API_BASE_URL, buildApiUrl } from "../../config/api";

interface ModalEditarItemProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    item: tItem | undefined;
}

export default function ModalEditarItem({ isOpen, onClose, onSuccess, item }: ModalEditarItemProps) {
    const { token } = useAuth();
    const [formData, setFormData] = useState<{
        nome: string;
        imagem: File | null;
        categoriaParteVeiculo: CategoriaParteVeiculo | "";
    }>({
        nome: "",
        imagem: null,
        categoriaParteVeiculo: "",
    });
    const URL_BASE_IMAGEM = API_BASE_URL;

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categorias: { label: string; value: CategoriaParteVeiculo }[] = [
        { label: "Dentro do Veículo", value: "DENTRO_DO_VEICULO" },
        { label: "Fora do Veículo", value: "FORA_DO_VEICULO" },
        { label: "Veículo no Chão", value: "VEICULO_NO_CHAO" },
        { label: "Veículo no Elevador", value: "VEICULO_NO_ELEVADOR" },
        { label: "Capô Levantado", value: "CAPO_LEVANTADO" },
    ];
    const [preview, setPreview] = useState<string | null>(null);

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, imagem: file }));

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        if (!item) {
            showErrorToast("Item não encontrado");
            setIsSubmitting(false);
            return;
        }

        const formPayload = new FormData();
        formPayload.append("nome", formData.nome);
        formPayload.append("parteDoVeiculo", formData.categoriaParteVeiculo);
        
        // Só envia a imagem se uma nova foi selecionada
        if (formData.imagem) {
            formPayload.append("imagem", formData.imagem);
        }

        try {
            const response = await fetch(buildApiUrl(`/itens/${item.id}`), {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formPayload,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    console.error(data.errors);
                    showErrorToast("Verifique os campos e tente novamente.");
                } else {
                    showErrorToast(data.message || "Erro ao atualizar o item.");
                }
                return;
            }

            showSuccessToast(data.message || "Item atualizado com sucesso!");
            onSuccess?.();
            onClose();
        } catch (error) {
            showErrorToast("Erro ao conectar com o servidor.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                nome: item.nome || "",
                imagem: null,
                categoriaParteVeiculo: item.parteDoVeiculo || "",
            });
            setPreview(null);
            setErrors({});
        }
    }, [isOpen, item]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Editar Item do Checklist">
            <form onSubmit={handleSubmit} className="form-editar-parte">
                <div>
                    <label htmlFor="nome">Nome do item</label>
                    <input
                        id="nome"
                        name="nome"
                        type="text"
                        value={formData.nome}
                        onChange={handleFormChange}
                        required
                        placeholder="Ex: Luzes do Painel"
                    />
                    {errors.nome && <span className="error">{errors.nome}</span>}
                </div>

                <div className="input-select-wrapper">
                    <label htmlFor="categoriaParteVeiculo">Parte do Veículo</label>
                    <SelectCustom
                        options={categorias}
                        value={formData.categoriaParteVeiculo}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                categoriaParteVeiculo: value as CategoriaParteVeiculo,
                            }))
                        }
                    />
                    {errors.categoriaParteVeiculo && (
                        <span className="error">{errors.categoriaParteVeiculo}</span>
                    )}
                </div>

                <div className="input-file-wrapper">
                    <label htmlFor="imagem">Imagem {formData.imagem ? "(Nova)" : "(Opcional - mantenha a atual)"}</label>
                    <input
                        type="file"
                        name="imagem"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    
                    {preview && (
                        <div className="preview-wrapper">
                            <img src={preview} alt="Preview da nova imagem" className="preview-image" />
                        </div>
                    )}
                    
                    {!preview && item?.imagemIlustrativa && (
                        <div className="current-image-wrapper">
                            <span className="current-image-label">Imagem atual:</span>
                            <div className="preview-wrapper">
                                <img 
                                    src={`${URL_BASE_IMAGEM}${item.imagemIlustrativa}`} 
                                    alt="Imagem atual" 
                                    className="preview-image" 
                                />
                            </div>
                        </div>
                    )}
                    
                    {errors.imagem && <span className="error">{errors.imagem}</span>}
                </div>

                {errors.geral && <p className="error">{errors.geral}</p>}

                <div className="form-buttons">
                    <button type="button" onClick={onClose}>
                        Cancelar
                    </button>
                    <Button 
                        text={isSubmitting ? "Atualizando..." : "Atualizar"} 
                        type="submit" 
                        secondary 
                        disabled={isSubmitting} 
                    />
                </div>
            </form>
        </Modal>
    );
}
