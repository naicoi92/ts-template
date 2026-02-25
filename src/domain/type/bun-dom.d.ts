/// <reference types="bun-types" />
/// <reference lib="dom" />
declare global {
    interface Request {
        method: string;
        url: string;
        headers: Headers;
        body: unknown;
    }
}

declare global {
    interface Response {
        status: number;
        statusText: string;
        json(): Promise<unknown>;
        arrayBuffer(): Buffer | null;
    }
}

declare global {
    type BunHandler<T extends string> = (
        request: BunRequest<T>
    ) => Promise<Response>;
    }
}
