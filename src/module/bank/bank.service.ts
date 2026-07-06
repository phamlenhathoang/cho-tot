import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BankRepository } from './bank.repository';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CreateBankDto } from './dto/create-bank.dto';

@Injectable()
export class BankService {
    constructor(
        private readonly bankRepository: BankRepository,
        private readonly httpService: HttpService
    ) { }

    async createBank(createBankDTO: CreateBankDto, userId: number) {
        const bin = await this.getBinByShortName(createBankDTO.name);
        if (!bin) {
            throw new InternalServerErrorException(`Không tìm thấy mã BIN cho ngân hàng: ${createBankDTO.name}`);
        }
        return await this.bankRepository.createBank(createBankDTO, userId, bin);
    }

    async getBankBinList(){
        try {
            const url = 'https://api.vietqr.io/v2/banks';

            // Bổ sung headers cấu hình User-Agent để vượt qua tường lửa Cloudflare của VietQR
            const config = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                }
            };

            // Gửi request kèm cấu hình headers mới
            const response = await firstValueFrom(this.httpService.get(url, config));

            if (response.data && response.data.code === '00') {
                return response.data.data;
            }

            throw new InternalServerErrorException('Cấu trúc phản hồi từ VietQR không hợp lệ');
        } catch (error) {
            // Log chi tiết lỗi ra console để bạn dễ dàng debug khi cần thiết
            console.error('Chi tiết lỗi VietQR:');
        }
    }

    // Hàm tìm kiếm mã BIN dựa trên shortName (Ví dụ: 'VietinBank')
    async getBinByShortName(shortName: string): Promise<string> {
        const banks = await this.getBankBinList();

        const bank = banks.find(b => b.shortName.toLowerCase() === shortName.toLowerCase());

        if (!bank) {
            throw new InternalServerErrorException(`Không tìm thấy mã BIN cho ngân hàng: ${shortName}`);
        }

        return bank.bin; // Sẽ trả về chuỗi mã BIN chuẩn (Ví dụ: "970415")
    }
}
