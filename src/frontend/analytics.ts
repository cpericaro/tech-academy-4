import type { ShortUrl } from '../types/index';

const API_URL = 'http://localhost:3001/api';

// Busca todas as URLs e monta a tabela de analytics
async function loadAnalytics(): Promise<void> {
    const container = document.getElementById('urlTable')!;

    try {
        const response = await fetch(`${API_URL}/urls`);
        const urls = await response.json() as ShortUrl[];

        if (urls.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma URL encurtada ainda.</p>';
            return;
        }

        container.innerHTML = urls.map((url) => createUrlCard(url)).join('');
    } catch {
        container.innerHTML = '<p class="empty-state">Erro ao carregar dados.</p>';
    }
}

// Cria o card de cada URL com link para a página de detalhes
function createUrlCard(url: ShortUrl): string {
    const shortUrl = `http://localhost:3001/${url.code}`;
    const date = new Date(url.createdAt).toLocaleDateString('pt-BR');

    return `
        <a href="/url-detail.html?code=${url.code}" class="url-card">
            <div class="url-card-info">
                <div class="url-card-code">${shortUrl}</div>
                <div class="url-card-original">${url.originalUrl} · criada em ${date}</div>
            </div>
            <div class="url-card-clicks">${url.clicks} cliques</div>
        </a>
    `;
}

void loadAnalytics();
