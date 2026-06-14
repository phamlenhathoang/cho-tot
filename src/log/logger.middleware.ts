import {
    Injectable,
    Logger,
    NestMiddleware,
} from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggerMiddleware.name);

    use(req: any, res: any, next: () => void) {
        const { method, originalUrl } = req;

        this.logger.log(
            `${method} ${originalUrl}`,
        );

        res.on('finish', () => {
            const { statusCode, statusMessage } = res;

            if (statusCode >= 400) {
                this.logger.error(
                    `${method} ${originalUrl} ${statusCode} - ${statusMessage}`,
                );
            }
        });

        next();
    }
}