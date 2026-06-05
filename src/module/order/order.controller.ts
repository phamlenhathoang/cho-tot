import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
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
}
