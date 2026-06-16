import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';
import OpenAI from 'openai';
import * as fs from "node:fs";
import { SwaggerParserService } from '../swagger/swagger-parser-service';

@Injectable()
export class AiService {
    private readonly client: GoogleGenAI
    private readonly openAI: OpenAI

    constructor(
        private readonly config: ConfigService,
        private readonly redisService: RedisService,
        private readonly swagger: SwaggerParserService,
    ) {
        this.client = new GoogleGenAI({
            apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY'),
        }),

            this.openAI = new OpenAI({
                apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY'),
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
            })
    }

    async getResponse(query: string) {
        const normalized = query.toLowerCase().trim();
        const key = crypto.createHash('md5')
            .update(normalized)
            .digest('hex');

        // Cache query result
        const cached = await this.redisService.get(key);

        if (cached) {
            return {
                source: 'cache',
                data: JSON.parse(cached),
            };
        }

        try {
            // Cache swagger context
            let apiContext = await this.redisService.get('swagger-context');

            if (!apiContext) {
                apiContext = await this.swagger.getApiContext();

                await this.redisService.set(
                    'swagger-context',
                    apiContext,
                    3600,
                );
            }

            const response = await this.openAI.chat.completions.create({
                model: 'gemini-3.5-flash',
                messages: [
                    {
                        role: 'system',
                        content: `
You are a senior backend API assistant.

Rules:

1. Find the best matching API.
2. If no API matches, return:

{
  "matched": false
}

3. If matched, return ONLY valid JSON:

{
  "matched": true,
  "endpoint": "",
  "method": "",
  "description": "",
  "requestBody": [],
  "response": ""
}

4. Never return markdown.
5. Never return explanation.
6. Return valid JSON only.

API DOCUMENTATION:
${apiContext}
                    `,
                    },
                    {
                        role: 'user',
                        content: query,
                    },
                ],
            });

            const content =
                response.choices[0]?.message?.content?.trim();

            if (!content) {
                throw new Error('Empty AI response');
            }

            let result: any;

            try {
                result = JSON.parse(content);
            } catch {
                result = {
                    matched: false,
                    raw: content,
                };
            }

            await this.redisService.set(
                key,
                JSON.stringify(result),
                3360,
            );

            return {
                source: 'ai',
                data: result,
            };
        } catch (error) {
            console.error(error);

            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'AI provider failed',
            );
        }
    }

    async search(query: string) {
        const key = crypto.createHash('md5').update(query).digest('hex');

        const cached = await this.redisService.get(key);
        if (cached) {
            return {
                source: 'cache',
                data: JSON.parse(cached)
            }
        } else {

            const response = await this.client.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: query,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            })
            const result = { answer: response.text }

            await this.redisService.set(key, JSON.stringify(result), 3360)

            return result;
        }
    }

    async createImage(prompt: string) {
        const response = await this.client.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: prompt,
        });

        const candidate = response.candidates?.[0];

        if (!candidate?.content?.parts) {
            throw new Error('No image generated');
        }

        for (const part of candidate.content!.parts!) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData!, "base64");
                fs.writeFileSync("gemini-native-image.png", buffer);
                console.log("Image saved as gemini-native-image.png");
            }
        }
    }
}
