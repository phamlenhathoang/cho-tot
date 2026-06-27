import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-messge.dto"
import { ConversationService } from "../conversation/conversation.service";
import { ConversationRepository } from "../conversation/conversation.repository";

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
        private readonly chatService: ChatService,
        private readonly conversation: ConversationService
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

    private isUserInConversationRoom(userId: number, conversationId: number): boolean {
        const conversationRoom = this.server.sockets.adapter.rooms.get(`conversation:${conversationId}`);
        const userRoom = this.server.sockets.adapter.rooms.get(`user:${userId}`);

        if (!conversationRoom || !userRoom) return false;

        // Kiểm tra có socket nào nằm trong CẢ HAI room không (giao nhau)
        for (const socketId of userRoom) {
            if (conversationRoom.has(socketId)) {
                return true;
            }
        }
        return false;
    }

    @SubscribeMessage('sendMessage')
    @UsePipes(new ValidationPipe({ transform: true }))
    async handleNewMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket
    ) {
        const senderId = client.data.userId;
        try {
            const { message, receiverId, conversationId } = await this.chatService.sendMessage(dto, senderId);

            this.server.to(`user:${receiverId}`).emit('newMessage', message);
            // client.broadcast.to(`conversation:${conversationId}`).emit('newMessage', message);

            // this.server
            // .to(`user:${receiverId}`)
            // .to(`conversation:${conversationId}`)
            // .emit('newMessage', message);

            const receiverIsViewing = this.isUserInConversationRoom(receiverId, conversationId);
            if (receiverIsViewing) {
                await this.chatService.markAsRead(conversationId, receiverId);
                // (gọi qua chatService, vì chatService đang là nơi xử lý nghiệp vụ message —
                // nếu bạn đã viết updateMessageIsRead ở ConversationRepository, có thể cần
                // expose lại qua đúng service tương ứng tuỳ bạn tổ chức module nào)
            }

            client.emit('messageSent', message);

            this.server
                .to(`user:${receiverId}`)
                .to(`user:${senderId}`)
                .emit('conversationUpdated', {
                    conversationId,
                    lastMessage: message,
                });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            client.emit('messageError', { error: errorMessage });
        }
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
        @MessageBody() data: { conversationId: number },
        @ConnectedSocket() client: Socket
    ) {
        const userId = client.data.userId
        const conversationId = Number(data.conversationId)

        const conversation = await this.conversation.getConversationById(conversationId, userId)
        if (!conversation) {
            client.emit('joinConversationError', { error: 'You do not have permission access this conversaion' })
            return
        }

        client.join(`conversation:${conversationId}`)
        this.logger.log(`userId=${userId} joined conversation: ${conversationId}`)

        client.emit('joinConversation', { conversationId })
    }
}

