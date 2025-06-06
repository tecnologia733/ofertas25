
import { useEffect, useState } from "react";

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [busca, setBusca] = useState("");
  const [marcaSelecionada, setMarcaSelecionada] = useState("");
  const [apenasVigentes, setApenasVigentes] = useState(false);

  useEffect(() => {
    fetch("https://ofertas-3ee57-default-rtdb.firebaseio.com/ofertas.json")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const lista = Object.values(data).filter((item) => item.ativo);
          setOfertas(lista);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  function formatarPreco(preco) {
    const n = parseFloat(preco);
    return isNaN(n) || n === 0
      ? ""
      : n.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  }

  function formatarData(dataStr) {
    if (!dataStr) return "";
    const data = new Date(dataStr);
    return isNaN(data)
      ? ""
      : data.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  }

  const marcas = [...new Set(ofertas.map((o) => o.marca).filter(Boolean))].sort();

  const hoje = new Date();
  const emTresDias = new Date();
  emTresDias.setDate(hoje.getDate() + 3);

  const ofertasFiltradas = ofertas
    .filter((oferta) =>
      oferta.descricao.toLowerCase().includes(busca.toLowerCase())
    )
    .filter((oferta) =>
      marcaSelecionada ? oferta.marca === marcaSelecionada : true
    )
    .filter((oferta) => {
      if (!apenasVigentes) return true;
      const validade = new Date(oferta.vigencia);
      return validade >= hoje && validade <= emTresDias;
    })
    .sort((a, b) => parseFloat(a.preco || 0) - parseFloat(b.preco || 0));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Ofertas Exclusivas</h1>

      <div className="max-w-4xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Buscar oferta..."
          className="w-full p-2 border border-gray-300 rounded"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={marcaSelecionada}
          onChange={(e) => setMarcaSelecionada(e.target.value)}
        >
          <option value="">Todas as marcas</option>
          {marcas.map((marca, index) => (
            <option key={index} value={marca}>
              {marca}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={apenasVigentes}
            onChange={(e) => setApenasVigentes(e.target.checked)}
          />
          <span className="text-sm">Vencendo em até 3 dias</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ofertasFiltradas.map((oferta, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
          >
            {oferta.imagem && (
              <img
                src={oferta.imagem}
                alt={oferta.descricao}
                className="w-full h-48 object-contain mb-4"
              />
            )}
            <p className="text-gray-800 font-medium mb-2">{oferta.descricao}</p>
            <p className="text-sm text-gray-600 mb-1">{formatarPreco(oferta.preco)}</p>
            {oferta.vigencia && (
              <p className="text-xs text-gray-500 mb-2">
                Válido até: {formatarData(oferta.vigencia)}
              </p>
            )}
            <a
              href={oferta.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded mt-auto"
            >
              Ver Oferta
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
