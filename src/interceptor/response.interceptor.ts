import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { APIResponse } from ".";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, APIResponse<T>> {

    private getDefaultMessage(method: string): string {
        switch (method) {
            case 'POST':
                return 'Created';
            case 'PUT':
                return 'Updated';
            case 'DELETE':
                return 'Deleted';
            case 'GET':
                return 'Got';
            default:
                return 'Success';
        }
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<APIResponse<T>> {

        const request = context.switchToHttp().getRequest();
        const now = new Date();

        const date = now.toLocaleString('vi-VN');

        return next
            .handle()
            .pipe(
                map((data: any) => {
                    if (data && typeof data === 'object' && 'success' in data) {
                        return data as APIResponse<T>;
                    }
                    let finalMessage = this.getDefaultMessage(request.method);

                    if (data && typeof data === 'object' && 'message' in data) {
                        finalMessage = data.message as string;

                        // delete data.message;
                        // const {message, ... rest } = data;
                        // data = Object.keys(rest).length > 0 ? rest : null;
                        const { message, ...rest } = data;
                        data = Object.keys(rest).length > 0 ? rest : undefined;
                    }

                    if (data && typeof data === 'object' && 'data' in data) {
                        data = data.data as T;
                    }



                    return {
                        success: true,
                        message: finalMessage,
                        data,
                        date: date,
                        path: request.url
                    }
                }))
    }
}
