export class JsonBody {
    private record: Record<string, Object> = {};
    put(key: string, value: string | boolean | number | Object): JsonBody {
        this.record[key] = value as Object;
        return this;
    }
    build(): Record<string, Object> {
        return this.record;
    }
}
export class JsonPayload {
    static parse<T>(raw: string, reviver?: (key: string, value: Object) => Object): T | null {
        let trimmed = raw.trim();
        const cutIdx = trimmed.indexOf('}{"output"');
        if (cutIdx >= 0) {
            trimmed = trimmed.substring(0, cutIdx + 1);
        }
        let v = JsonPayload.tryParse<T>(trimmed, reviver);
        if (v !== null) {
            return v;
        }
        const jsonFence = /```json\s*/;
        const fenceMatch = jsonFence.exec(trimmed);
        if (fenceMatch !== null && fenceMatch.index !== undefined) {
            const after = trimmed.substring(fenceMatch.index + fenceMatch[0].length);
            const endIdx = after.indexOf('```');
            if (endIdx >= 0) {
                const inner = after.substring(0, endIdx).trim();
                v = JsonPayload.tryParse<T>(inner, reviver);
                if (v !== null) {
                    return v;
                }
            }
        }
        const genericFence = /```/;
        const genericMatch = genericFence.exec(trimmed);
        if (genericMatch !== null && genericMatch.index !== undefined) {
            const after = trimmed.substring(genericMatch.index + genericMatch[0].length);
            const endIdx = after.indexOf('```');
            if (endIdx >= 0) {
                const inner = after.substring(0, endIdx).trim();
                v = JsonPayload.tryParse<T>(inner, reviver);
                if (v !== null) {
                    return v;
                }
            }
        }
        const slice = JsonPayload.extractFirstJsonObject(trimmed);
        if (slice !== null) {
            return JsonPayload.tryParse<T>(slice, reviver);
        }
        return null;
    }
    /** 取第一个完整 JSON 对象，避免流式尾包 `{"output":...}` 导致截错 */
    private static extractFirstJsonObject(raw: string): string | null {
        const start = raw.indexOf('{');
        if (start < 0) {
            return null;
        }
        let depth = 0;
        let inString = false;
        let escape = false;
        for (let i = start; i < raw.length; i++) {
            const c = raw.charAt(i);
            if (inString) {
                if (escape) {
                    escape = false;
                }
                else if (c === '\\') {
                    escape = true;
                }
                else if (c === '"') {
                    inString = false;
                }
            }
            else if (c === '"') {
                inString = true;
            }
            else if (c === '{') {
                depth += 1;
            }
            else if (c === '}') {
                depth -= 1;
                if (depth === 0) {
                    return raw.substring(start, i + 1);
                }
            }
        }
        return null;
    }
    private static tryParse<T>(text: string, reviver?: (key: string, value: Object) => Object): T | null {
        try {
            return JSON.parse(text, reviver) as T;
        }
        catch (_e) {
            return null;
        }
    }
}
