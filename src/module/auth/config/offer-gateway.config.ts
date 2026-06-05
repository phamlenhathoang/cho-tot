import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from "src/prisma/prisma.service";
import { Socket, Server} from 'socket.io';
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "../guards/ws-jwt/ws-jwt.guard";

@UseGuards(WsJwtGuard)
@WebSocketGateway({
    cors: { origin: '*' },
})

export class OfferGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server !: Server
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    handleDisconnect(client: any) {
        console.log(client.id);
    }
    handleConnection(client) {
        console.log(client.id);
    }

    @SubscribeMessage("joinOffer")
    async handleJoinOffer(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: {
            postId: number
        }
    ) {
        const post = await this.prismaService.post.findUnique({
            where: {
                id: Number(data.postId)
            },
            include: {
                offers: {
                    orderBy: {
                        createAt: "asc"
                    },
                    include: {
                        buyer: true
                    }
                },
                images: true,
                category: true,
                author: true
            }
        })
        if (!post) {
            client.emit("exception", {
                message: "Post does not exist"
            });
            return;
        }

        const room = `offer_${post.id}`

        client.join(room);

        client.emit('joinOffer', {
            room: room,
            postid: post.id,
            offers: post.offers,
            authorName: post.author.name,
            createAt: post.createdAt.toDateString(),
            name: post.title,
            content: post.content,
            images: post.images
        })
    }

    @SubscribeMessage("newPrice")
    async handleNewOffer(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: {
            postId: number,
            buyerId: number,
            price: number
        }
    ) {
        const post = await this.prismaService.post.findUnique({
            where: {
                id: Number(data.postId)
            }
        })

        if (!post) {
            return;
        }

        const buyer = await this.prismaService.user.findUnique({
            where: {
                id: Number(data.buyerId)
            }
        })

        if (!buyer) {
            return;
        }

        const room = `offer_${post.id}`

        const offer = await this.prismaService.offer.create({
            data:{
                price: Number(data.price),
                buyerId: buyer.id,
                postId: post.id
            }
        })

        this.server.to(room).emit('newOffer',{
            name: buyer.name,
            price: offer.price,
            createAt: offer.createAt
        })
    }
}