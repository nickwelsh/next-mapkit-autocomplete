import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import generateMapKitJwt from '@/app/utils/generate-mapkit-jwt'

export const createPost = publicProcedure
	.input(
		z.object({
			title: z.string(),
			content: z.string(),
		})
	)
	.mutation(async options => {
		return {
			id: '1',
			...options.input,
		}
	})

export const appRouter = router({
	mapkitJwt: publicProcedure.query(async () => {
		return await generateMapKitJwt()
	}),

	mapkitAuthToken: publicProcedure.query(async () => {
		return await fetch('https://maps-api.apple.com/v1/token', {
			headers: {
				Authorization: `Bearer ${await generateMapKitJwt()}`,
			},
			next: { revalidate: 1800 },
		})
			.then(response => response.json() as Promise<{ accessToken: string; expiresInSeconds: number }>)
			.then(response => response.accessToken)
	}),

	createPost,
})

export type AppRouter = typeof appRouter
