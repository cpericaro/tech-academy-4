import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createTable } from './db/queries';
import { connect, startConsumer, publishClick } from './services/rabbitService';
import { findByCode } from './db/queries';
import apiRoutes from './routes/urls';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] ?? 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos do frontend (HTML, CSS)
app.use(express.static(path.join(__dirname, '../../public')));

// Serve o JavaScript compilado do frontend
app.use('/js', express.static(path.join(__dirname, '../frontend')));

// Rotas da API REST
app.use('/api', apiRoutes);

// Redireciona URL curta para a URL original
app.get('/:code', async (req, res) => {
    const code = req.params['code']!;
    const url = await findByCode(code);

    if (!url) {
        res.status(404).send('URL não encontrada');
        return;
    }

    // Publica o evento de clique na fila do RabbitMQ
    publishClick(code);

    res.redirect(url.originalUrl);
});

async function main() {
    // Cria a tabela no banco caso não exista
    await createTable();

    // Tenta conectar ao RabbitMQ (opcional para desenvolvimento)
    try {
        await connect();
        await startConsumer();
    } catch {
        console.warn('RabbitMQ indisponível. Cliques não serão contabilizados.');
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

main();
