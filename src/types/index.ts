// Tipos compartilhados entre frontend e backend

type ShortUrl = {
    id: number;
    code: string;
    originalUrl: string;
    clicks: number;
    createdAt: string;
};

type CreateUrlRequest = {
    url: string;
};

type CreateUrlResponse = {
    code: string;
    shortUrl: string;
};

// Evento publicado na fila quando alguém clica em um link encurtado
type ClickEvent = {
    code: string;
    timestamp: string;
};

export type { ShortUrl, CreateUrlRequest, CreateUrlResponse, ClickEvent };
