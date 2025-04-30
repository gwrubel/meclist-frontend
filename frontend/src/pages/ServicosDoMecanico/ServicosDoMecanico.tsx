import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tMecanico } from "../../types/Mecanico";
import Loading from "../../components/Loading/Loading";

export default function ServicosDoMecanico() {
    const { id } = useParams<{ id: string }>();
    const [mecanico, setMecanico] = useState<tMecanico | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMecanico = async () => {
            try {
                const response = await fetch(`http://localhost:8080/mecanicos/${id}`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar dados do mecânico");
                }
                const data: tMecanico = await response.json();
                setMecanico(data);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError("Erro desconhecido");
            } finally {
                setLoading(false);
            }
        };

        fetchMecanico();
    }, [id]);

    if (loading) return <Loading />;
    if (error) return <p>{error}</p>;
    if (!mecanico) return <p>Mecânico não encontrado.</p>;

    return (
        <div>
        
        </div>
    );
}
