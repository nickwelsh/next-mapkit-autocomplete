import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export function createContext(options?: FetchCreateContextFnOptions) {
	return {
		headers: options && Object.fromEntries(options.req.headers),
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
