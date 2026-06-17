import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SaveAddressDTO } from "./dto/save-address.dto";

@Injectable()
export class AddressRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async saveAddress(addressDto: SaveAddressDTO){

        await this.prismaService.address.updateMany({
            where:{
                userId: addressDto.userId,
                isDefault: true
            },
            data:{
                isDefault: false
            }
        })

        return await this.prismaService.address.create({
            data: {
                ...addressDto,
                isDefault: true
            }
        })
    }

    async getAddressByUserId(userId: number){
        return await this.prismaService.address.findFirst({
            where:{
                userId: userId,
                isDefault: true
            }
        })
    }
}