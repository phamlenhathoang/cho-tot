import { Injectable } from "@nestjs/common";
import { parseRequestBody } from 'src/common/helper/parseRequestBody';

@Injectable()
export class SwaggerParserService {
    async getApiContext() {
        const res = await fetch('http://localhost:3000/api-json'); //Truy cập vào đường link này 
        const swagger = await res.json(); //Lấy file json trong đường link đó ra

        const paths = swagger.paths;//Lấy hết danh sách api trong swagger

        let context = 'API LIST:\n\n'; //Tao chuỗi context rỗng bắt đầu là API LIST:

        for (const path in paths) { //Duyệt từng api trong danh sách api được lấy trong swagger
            for (const method in paths[path]) { //Duyệt từng method của từng api
                const api = paths[path][method]; //Lấy thông từng api và method: bao gồm summary, requestBody, response...

                const requestBodySchema =
                    api.requestBody?.content?.['application/json']?.schema; //Lấy schema trong application/json và trong requestBody

                let requestBodyFields: any[] = []; 

                if (requestBodySchema?.$ref) { //Kiểm tra trong requestBody có phải ref không

                    const schemaName =
                        requestBodySchema.$ref.split('/').pop(); //Lấy DTO ở ref ra 

                    const realSchema =
                        swagger.components.schemas[schemaName];//Lấy schema thật được lưu trong properties

                    requestBodyFields =
                        parseRequestBody(realSchema);//Ép kiểu sang requestBody
                }
                else if (requestBodySchema) {

                    requestBodyFields =
                        parseRequestBody(requestBodySchema);//Nếu không phải ref thì sẽ ép kiểu sang request body
                }

                context += `
                            METHOD: ${method.toUpperCase()}
                            PATH: ${path}

                            SUMMARY: ${api.summary || 'no description'}
                            TAGS: ${api.tags?.join(', ') || 'none'}

                           REQUEST BODY:
                            ${requestBodyFields.length > 0
                            ? JSON.stringify(requestBodyFields, null, 2)
                            : 'none'}

                            RESPONSE:
                            ${api.responses ? JSON.stringify(api.responses, null, 2) : 'none'}

                            ---------------------------------------
                            `;
            }
        }

        return context;
    }


}
