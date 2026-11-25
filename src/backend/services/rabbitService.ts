import amqplib from 'amqplib';
import type { ClickEvent } from '../../types/index';
import { incrementClicks } from '../db/queries';

// Nome da fila usada para registrar os cliques
const QUEUE_NAME = 'url.clicked';

let channel: amqplib.Channel | null = null;

// Conecta ao RabbitMQ e cria o canal de comunicação
async function connect(): Promise<void> {
    const url = process.env['RABBITMQ_URL'] ?? 'amqp://localhost';
    const connection = await amqplib.connect(url);
    channel = await connection.createChannel();

    // durable: true faz a fila sobreviver a reinicializações do RabbitMQ
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('RabbitMQ conectado');
}

// Publica um evento de clique na fila
function publishClick(code: string): void {
    if (!channel) return;

    const event: ClickEvent = {
        code,
        timestamp: new Date().toISOString(),
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(event)));
}

// Fica escutando a fila e atualiza o banco quando chega um evento
async function startConsumer(): Promise<void> {
    if (!channel) return;

    channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString()) as ClickEvent;
        await incrementClicks(event.code);

        // Confirma que a mensagem foi processada
        channel!.ack(msg);
    });

    console.log('Consumidor da fila iniciado');
}

export { connect, publishClick, startConsumer };
