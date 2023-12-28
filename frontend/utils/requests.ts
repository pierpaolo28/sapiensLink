async function req<Q, A>(method: string, url: string, data?: Q): Promise<A> {
    const response = await fetch(url, {
        method,
        body: data && JSON.stringify(data),
    });

    if (response.status > 299) {
        throw new Error(
            `Request failed with ${response.statusText}: `
            + `${await response.text()}`
        );
    }

    return response.json();
}

const CACHE = new Map();
async function get<A>(url: string): Promise<A> {
    if (CACHE.has(url)) return CACHE.get(url);
    const result = req<void, A>("GET", url);
    CACHE.set(url, result);
    return result;
}

async function post<Q, A>(url: string, data: Q): Promise<A> {
    return req("POST", url, data);
}

const BASE_URL = "http://localhost/api"

export function makeGet<A>(path: string): () => Promise<A> {
    return async () => get(BASE_URL + path)
}

export function makePost<Q, A>(path: string): (data: Q) => Promise<A> {
    return async (data: Q) => post(BASE_URL + path, data)
}