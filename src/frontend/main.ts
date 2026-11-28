import type { ShortUrl, CreateUrlResponse } from '../types/index';

const API_URL = 'http://localhost:3001/api';

// Busca o histórico de URLs e renderiza na tela
async function loadHistory(): Promise<void> {
    const urlList = document.getElementById('urlList')!;

    try {
        const response = await fetch(`${API_URL}/urls`);
        const urls = await response.json() as ShortUrl[];

        if (urls.length === 0) {
            urlList.innerHTML = '<p class="empty-state">Nenhuma URL encurtada ainda.</p>';
            return;
        }

        urlList.innerHTML = urls.map((url) => createUrlCard(url)).join('');
    } catch {
        urlList.innerHTML = '<p class="empty-state">Erro ao carregar histórico.</p>';
    }
}

// Cria o HTML de um card de URL
function createUrlCard(url: ShortUrl): string {
    const shortUrl = `http://localhost:3001/${url.code}`;

    return `
        <a href="/url-detail.html?code=${url.code}" class="url-card">
            <div class="url-card-info">
                <div class="url-card-code">${shortUrl}</div>
                <div class="url-card-original">${url.originalUrl}</div>
            </div>
            <div class="url-card-clicks">${url.clicks} cliques</div>
        </a>
    `;
}

// Envia a URL para a API e exibe o resultado
async function shortenUrl(): Promise<void> {
    const input = document.getElementById('urlInput') as HTMLInputElement;
    const result = document.getElementById('result')!;
    const url = input.value.trim();

    if (!url) return;

    try {
        const response = await fetch(`${API_URL}/shorten`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json() as CreateUrlResponse & { error?: string };

        if (!response.ok) {
            result.className = 'result-box error';
            result.textContent = data.error ?? 'Erro ao encurtar URL';
            result.classList.remove('hidden');
            return;
        }

        result.className = 'result-box success';
        result.innerHTML = `URL encurtada: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
        result.classList.remove('hidden');

        input.value = '';
        await loadHistory();
    } catch {
        result.className = 'result-box error';
        result.textContent = 'Erro ao conectar com o servidor.';
        result.classList.remove('hidden');
    }
}

// Inicializa os eventos da página
function init(): void {
    const btn = document.getElementById('shortenBtn')!;
    const input = document.getElementById('urlInput') as HTMLInputElement;

    btn.addEventListener('click', () => void shortenUrl());

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') void shortenUrl();
    });

    void loadHistory();
}

init();
