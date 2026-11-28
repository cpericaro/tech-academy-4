import type { ShortUrl } from '../types/index';

const API_URL = 'http://localhost:3001/api';

// Pega o parâmetro "code" da URL da página
function getCodeFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

// Busca os dados da URL e renderiza os detalhes
async function loadDetail(): Promise<void> {
    const container = document.getElementById('detail')!;
    const code = getCodeFromUrl();

    if (!code) {
        container.innerHTML = '<p class="empty-state">Código não informado.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/urls/${code}`);

        if (!response.ok) {
            container.innerHTML = '<p class="empty-state">URL não encontrada.</p>';
            return;
        }

        const url = await response.json() as ShortUrl;
        container.innerHTML = createDetailHtml(url);

        document.title = `/${url.code} — URL Shortener`;
    } catch {
        container.innerHTML = '<p class="empty-state">Erro ao carregar dados.</p>';
    }
}

// Monta o HTML da página de detalhes
function createDetailHtml(url: ShortUrl): string {
    const shortUrl = `http://localhost:3001/${url.code}`;
    const createdAt = new Date(url.createdAt).toLocaleString('pt-BR');

    return `
        <h1 class="detail-title">/${url.code}</h1>

        <div class="detail-grid">
            <div class="detail-card">
                <div class="detail-card-label">Cliques</div>
                <div class="detail-card-value">${url.clicks}</div>
            </div>
            <div class="detail-card">
                <div class="detail-card-label">Criada em</div>
                <div class="detail-card-value" style="font-size: 15px">${createdAt}</div>
            </div>
        </div>

        <div class="detail-card" style="margin-bottom: 12px">
            <div class="detail-card-label">URL curta</div>
            <div class="detail-url"><a href="${shortUrl}" target="_blank">${shortUrl}</a></div>
        </div>

        <div class="detail-card">
            <div class="detail-card-label">URL original</div>
            <div class="detail-url">${url.originalUrl}</div>
        </div>
    `;
}

void loadDetail();
