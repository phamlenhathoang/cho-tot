export function parseRequestBody(schema: any) {
    if (!schema?.properties) return [];

    const required = schema.required || [];

    return Object.entries(schema.properties).map(
        ([key, value]: [string, any]) => ({
            field: key,
            type: value.type || 'string',
            required: required.includes(key),
            description: value.description,
            example: value.example,
        }),
    );
}
