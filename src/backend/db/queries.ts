import pool from './database';
import type { ShortUrl } from '../../types/index';

// Cria a tabela de URLs caso não exista ainda
async function createTable(): Promise<void> {
    const sql = `
        CREATE TABLE IF NOT EXISTS urls (
            id          SERIAL PRIMARY KEY,
            code        VARCHAR(10) UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            clicks      INTEGER DEFAULT 0,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    `;
    await pool.query(sql);
}

// Insere uma nova URL encurtada no banco
async function insertUrl(code: string, originalUrl: string): Promise<ShortUrl> {
    const sql = `
        INSERT INTO urls (code, original_url)
        VALUES ($1, $2)
        RETURNING id, code, original_url as "originalUrl", clicks, created_at as "createdAt"
    `;
    const result = await pool.query<ShortUrl>(sql, [code, originalUrl]);
    return result.rows[0]!;
}

// Busca uma URL pelo código curto
async function findByCode(code: string): Promise<ShortUrl | null> {
    const sql = `
        SELECT id, code, original_url as "originalUrl", clicks, created_at as "createdAt"
        FROM urls WHERE code = $1
    `;
    const result = await pool.query<ShortUrl>(sql, [code]);
    if (result.rows.length === 0) return null;
    return result.rows[0]!;
}

// Retorna todas as URLs em ordem do mais recente
async function findAll(): Promise<ShortUrl[]> {
    const sql = `
        SELECT id, code, original_url as "originalUrl", clicks, created_at as "createdAt"
        FROM urls ORDER BY created_at DESC
    `;
    const result = await pool.query<ShortUrl>(sql);
    return result.rows;
}

// Incrementa o contador de cliques de uma URL
async function incrementClicks(code: string): Promise<void> {
    const sql = `UPDATE urls SET clicks = clicks + 1 WHERE code = $1`;
    await pool.query(sql, [code]);
}

export { createTable, insertUrl, findByCode, findAll, incrementClicks };
