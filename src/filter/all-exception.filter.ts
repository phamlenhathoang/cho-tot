
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { APIResponse } from '../interceptor/index';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
import path from 'path';
import dayjs from 'dayjs';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status : number;
    let message : string = 'There is an error';
    let error : any;

    //when error has purpose(know in advance(biết trước) - http)
    if(exception instanceof HttpException){
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        if(typeof exceptionResponse === 'string'){
            message = exceptionResponse;
        }else if(typeof exceptionResponse === 'object'){
            const exceptionResponseObj = exceptionResponse as Record<string, any>;
            message = exception.message|| exceptionResponseObj.error || 'There is an error. Please try again!'
            
            //invalid data DTO error
            if(Array.isArray(exceptionResponseObj.message)){
                message = "Invalid data";
                error = exceptionResponseObj.message;
            }
        }
    }else{ //unintentional error(lỗi ngoài ý muốn)
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'System error'
        this.logger.error(exception);
    }

    const dateFormatted = dayjs(new Date()).format('HH:mm DD/MM/YYYY'); 

    const errorResponse : APIResponse<any> = {
        success : false,
        message,
        ...(error && error),
        date : dateFormatted,
        path : request.url,
    }

    response.status(status).json(errorResponse);
  }

  
}
