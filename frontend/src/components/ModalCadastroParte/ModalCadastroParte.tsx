import { useState, useEffect } from "react";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { CategoriaParteVeiculo } from "../../types/ParteVeiculo";
import "./ModalCadastroParte.css";

interface ModalCadastroParteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ModalCadastroParte({ isOpen, onClose, onSuccess }: ModalCadastroParteProps) {
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

        if (!formData.imagem) {
            setErrors({ imagem: "Selecione uma imagem" });
            setIsSubmitting(false);
            return;
        }

        const formPayload = new FormData();
        formPayload.append("nome", formData.nome);
        formPayload.append("categoriaParteVeiculo", formData.categoriaParteVeiculo);
        formPayload.append("imagem", formData.imagem);

        try {
            const response = await fetch("http://localhost:8080/parte-veiculo", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formPayload,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                    showErrorToast("Verifique os campos e tente novamente.");
                } else {
                    showErrorToast(data.message || "Erro ao cadastrar a parte.");
                }
                return;
            }

            showSuccessToast(data.message || "Parte cadastrada com sucesso.");
            onSuccess?.();
        } catch (error) {
            showErrorToast("Erro ao conectar com o servidor.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData({
                nome: "",
                imagem: null,
                categoriaParteVeiculo: "",
            });
            setErrors({});
        }
    }, [isOpen]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Cadastrar Parte do Checklist">
            <form onSubmit={handleSubmit} className="form-cadastro-parte">
                <div>
                    <label htmlFor="nome">Nome da Parte</label>
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
                    <label htmlFor="categoriaParteVeiculo">Categoria</label>
                    <select
                        name="categoriaParteVeiculo"
                        value={formData.categoriaParteVeiculo}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="">Selecione...</option>
                        {categorias.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    {errors.categoriaParteVeiculo && <span className="error">{errors.categoriaParteVeiculo}</span>}
                </div>

                <div className="input-file-wrapper">
                    <label htmlFor="imagem">Imagem</label>
                    <input
                        type="file"
                        name="imagem"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                    />
                    {preview && (
                        <div className="preview-wrapper">
                            <img src={preview} alt="Preview" className="preview-image" />
                        </div>
                    )}
                    {errors.imagem && <span className="error">{errors.imagem}</span>}
                </div>

                {errors.geral && <p className="error">{errors.geral}</p>}

                <div className="form-buttons">
                    <button type="button" onClick={onClose}>
                        Cancelar
                    </button>
                    <Button text={isSubmitting ? "Cadastrando..." : "Cadastrar"} type="submit" secondary disabled={isSubmitting} />
                </div>
            </form>
        </Modal>
    );
}
