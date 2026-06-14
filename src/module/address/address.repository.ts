import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SaveAddressDTO } from "./dto/save-address.dto";

@Injectable()
export class AddressRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async saveAddress(address: SaveAddressDTO){
        return await this.prismaService.address.create({
            data: address
        })
    }
}