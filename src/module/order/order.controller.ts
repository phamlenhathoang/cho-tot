import { Body, Controller, Post, Query, Req, UseGuards, Get} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOrderDTO } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('update-order')
  async updateOrder(@Req() rq, @Body() order: UpdateOrderDTO){
    return await this.orderService.updateOrder(order, rq.user)
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('get-order-and-tracking')
  async getOrderAndTrackingByOrderId(@Req() rq, @Query('orderId') orderId: string){
    return await this.orderService.getOrderAndTrackingByOrderId(Number(orderId), rq.user)
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('get-order-by-order-id')
  async getOrderByOrderId(@Req() rq, @Query('orderId') orderId: string){
    return await this.orderService.getOrderById(Number(orderId), rq.user)
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('get-all-order-by-user')
  async getAllOrderByUser(@Req() rq){
    return await this.orderService.getAllOrderByUser(rq.user.id)
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('get-order-by-post-id')
  async getOrderByPostId(@Req() rq, @Query('postId') postId: string){
    return await this.orderService.getOrderByPostId(Number(postId), rq.user)
  }
}
