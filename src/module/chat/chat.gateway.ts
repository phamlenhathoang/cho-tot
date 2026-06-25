import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-messge.dto";

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*'
    }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server !: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService
    ) { }

    handleConnection(client: any, ...args: any[]) {
        try {
            const token = client.handshake.auth?.token;

            if (!token) {
                throw new Error('Please provide token');
            }

            const payload = this.jwtService.verify(token);

            client.data.userId = payload.sub;

            client.join(`user:${client.data.userId}`)
            this.logger.log(`Client connected: userId=${client.data.userId}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            this.logger.warn(`Connection rejected: ${message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: any) {
        this.logger.log(`Client disconnected: userId=${client.data.userId}`);
    }

    @SubscribeMessage('sendMessage')
    @UsePipes(new ValidationPipe({ transform: true }))
    async handleNewMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket
    ) {
        const senderId = client.data.userId;
        try {
            const { message, receiverId } = await this.chatService.sendMessage(dto, senderId);
            this.server.to(`user:${receiverId}`).emit('newMessage', message);

            client.emit('messageSent', message);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            client.emit('messageError', { error: errorMessage });
        }
    }
}

