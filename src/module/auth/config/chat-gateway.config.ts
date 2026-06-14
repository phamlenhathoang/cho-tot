import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';

import { Server, Socket } from 'socket.io';

import { PrismaService } from 'src/prisma/prisma.service';
import { WsJwtGuard } from '../guards/ws-jwt/ws-jwt.guard';
import { UserService } from 'src/module/user/user.service';
import { PostService } from 'src/module/post/post.service';
import { JwtService } from '@nestjs/jwt';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly jwtService: JwtService
  ) { }

  private onlineUsers = new Map<number, string>();

  @WebSocketServer()
  server!: Server;

  async handleConnection(
    client: Socket
  ) {

    console.log(
      'CONNECTED:',
      client.id
    );

    try {

      const token =
        client.handshake.auth.token;

      if (!token) {

        client.disconnect();

        return;
      }

      const payload =
        await this.jwtService.verifyAsync(
          token
        );

      const userId =
        Number(payload.sub);

      const user =
        await this.userService.getById(
          userId
        );

      if (!user) {

        client.disconnect();

        return;
      }

      client.data.user =
        payload;

      client.data.userId =
        user.id;

      this.onlineUsers.set(
        user.id,
        client.id
      );

      console.log(
        `USER ONLINE: ${user.name}`
      );

      client.emit(
        'me',
        {
          id: user.id,
          name: user.name
        }
      );

      client.broadcast.emit(
        'userOnline',
        {
          userId: user.id
        }
      );

    } catch (error) {

      console.log(error);

      client.disconnect();

    }

  }

  handleDisconnect(client: Socket) {

    const userId =
      client.data.userId;

    if (userId) {

      this.onlineUsers.delete(userId);

      client.broadcast.emit(
        'userOffline',
        {
          userId
        }
      );

    }

  }

  /* ======================
     JOIN CONVERSATION
  ====================== */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      seller: number;
      postId: number;
    },
  ) {
    const user = client.data.user;
    const checkUser = await this.userService.getById(user.sub);
    if (!checkUser) {
      throw new NotFoundException("User does not exist");
    }

    const checkSeller = await this.userService.getById(data.seller);
    if (!checkSeller) {
      throw new NotFoundException("User does not exist");
    }

    const post = await this.postService.getPostById(Number(data.postId))
    if(!post){
      throw new NotFoundException("Post does not exist");
    }

    let conversation =
      await this.prisma.conversation.findFirst({
        where: {
          postId: Number(data.postId),
          OR: [
            {
              buyerId: user.sub,
              sellerId: data.seller,
            },
            {
              buyerId: data.seller,
              sellerId: user.sub,
            },
          ],
        },
        include: {
          messages: {
            include: {
              sender: true
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      });

    if (!conversation) {
      conversation =
        await this.prisma.conversation.create({
          data: {
            buyerId: user.sub,
            sellerId: data.seller,
            postId: data.postId,
          },
          include: {
            messages: {
              include: {
                sender: true
              },
              orderBy: {
                createdAt: "asc"
              }
            }
          }
        });
    }

    const room = `conversation_${conversation.id}`;

    client.join(room);

    console.log(`${client.id} joined ${room}`);

    const ortherUserId = conversation.buyerId === user.sub ? conversation.sellerId : conversation.buyerId;
    const isUserOnline = this.onlineUsers.has(ortherUserId)

    client.emit('joinedConversation', {
      conversationId: conversation.id,
      room,
      userId: user.sub,
      sellerName: checkSeller.name,
      messages: conversation.messages,
      name: post.title,
      image: post.images.find(img => img.isAvatar === true)?.url,
      isUserOnline
    });

  }

  /* ======================
     SEND MESSAGE
  ====================== */
  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      seller: number;
      postId: number;
      content: string;
    },
  ) {
    const user = client.data.user;

    const checkUser = await this.userService.getById(user.sub);
    if (!checkUser) {
      throw new NotFoundException("User does not exist");
    }

    const checkSeller = await this.userService.getById(data.seller);
    if (!checkSeller) {
      throw new NotFoundException("User does not exist");
    }

    let conversation =
      await this.prisma.conversation.findFirst({
        where: {
          OR: [
            {
              buyerId: user.sub,
              sellerId: data.seller,
            },
            {
              buyerId: data.seller,
              sellerId: user.sub,
            },
          ],
        },
      });

    if (!conversation) {
      conversation =
        await this.prisma.conversation.create({
          data: {
            buyerId: user.sub,
            sellerId: data.seller,
            postId: data.postId,
          },
        });
    }

    const room = `conversation_${conversation.id}`;

    const message =
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.sub,
          content: data.content,
        },
        include: {
          sender: true,
        },
      });

    this.server.to(room).emit('message', {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      createdAt: message.createdAt,
    });

    console.log('MESSAGE EMITTED TO:', room);
  }

}