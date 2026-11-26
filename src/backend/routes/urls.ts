import { Router } from 'express';
import type { Request, Response } from 'express';
import type { CreateUrlRequest } from '../../types/index';
import urlService from '../services/urlService';
import { findAll, findByCode } from '../db/queries';

const router = Router();

// POST /api/shorten - recebe uma URL e retorna a versão encurtada
router.post('/shorten', async (req: Request, res: Response) => {
    const body = req.body as CreateUrlRequest;

    if (!body.url) {
        res.status(400).json({ error: 'URL não informada' });
        return;
    }

    try {
        const result = await urlService.shorten(body.url);
        res.status(201).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao encurtar URL';
        res.status(400).json({ error: message });
    }
});

// GET /api/urls - retorna a lista de todas as URLs encurtadas
router.get('/urls', async (_req: Request, res: Response) => {
    try {
        const urls = await findAll();
        res.json(urls);
    } catch {
        res.status(500).json({ error: 'Erro ao buscar URLs' });
    }
});

// GET /api/urls/:code - retorna os dados de uma URL específica
router.get('/urls/:code', async (req: Request, res: Response) => {
    try {
        const url = await findByCode(req.params['code']!);
        if (!url) {
            res.status(404).json({ error: 'URL não encontrada' });
            return;
        }
        res.json(url);
    } catch {
        res.status(500).json({ error: 'Erro ao buscar URL' });
    }
});

export default router;
