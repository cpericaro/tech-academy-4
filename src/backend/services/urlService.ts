import type { CreateUrlResponse } from '../../types/index';
import { insertUrl, findByCode } from '../db/queries';

class UrlService {
    // Atributos
    private baseUrl: string;

    // Construtor
    constructor() {
        this.baseUrl = process.env['BASE_URL'] ?? 'http://localhost:3001';
    }

    // Gera um código aleatório de 6 caracteres
    private generateCode(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            const index = Math.floor(Math.random() * chars.length);
            code += chars[index];
        }
        return code;
    }

    // Verifica se a URL começa com http ou https
    private isValidUrl(url: string): boolean {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    // Encurta uma URL e salva no banco de dados
    async shorten(originalUrl: string): Promise<CreateUrlResponse> {
        if (!this.isValidUrl(originalUrl)) {
            throw new Error('URL inválida. Use http:// ou https://');
        }

        // Garante que o código gerado não existe ainda
        let code = this.generateCode();
        let exists = await findByCode(code);
        while (exists !== null) {
            code = this.generateCode();
            exists = await findByCode(code);
        }

        await insertUrl(code, originalUrl);

        return {
            code,
            shortUrl: `${this.baseUrl}/${code}`,
        };
    }

    // Busca a URL original pelo código curto
    async getOriginalUrl(code: string): Promise<string | null> {
        const url = await findByCode(code);
        if (!url) return null;
        return url.originalUrl;
    }
}

export default new UrlService();
