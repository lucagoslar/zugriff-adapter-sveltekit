type respondWith = (response: string | number | Object | Response) => void;

interface zugriffRequest extends Request {
	respondWith: respondWith;
}

type callback = (request: zugriffRequest) => void;

declare function addEventListener(string, callback): void;
