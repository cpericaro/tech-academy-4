import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Cria o pool de conexões com o PostgreSQL usando variáveis de ambiente
const pool = new Pool({
    host: process.env['DB_HOST'],
    port: Number(process.env['DB_PORT']),
    database: process.env['DB_NAME'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
});

export default pool;
