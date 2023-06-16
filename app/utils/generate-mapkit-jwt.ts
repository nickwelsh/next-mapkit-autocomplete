import { importPKCS8, SignJWT } from 'jose'

export default async function generateMapKitJwt() {
	const teamId = process.env.MAPKIT_TEAM_ID
	if (!teamId) throw new Error('Missing MAPKIT_TEAM_ID')

	const keyId = process.env.MAPKIT_KEY_ID
	if (!keyId) throw new Error('Missing MAPKIT_KEY_ID')

	const key = process.env.MAPKIT_KEY
	if (!key) throw new Error('Missing MAPKIT_KEY')

	const privateKey = await importPKCS8(key, 'ES256')
	const payload: { origin?: string } = {}
	// if (config?.origin) {
	// 	payload.origin = config.origin
	// }

	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
		.setIssuer(teamId)
		.setIssuedAt(Math.floor(Date.now() / 1000))
		.setExpirationTime('30m')
		.sign(privateKey)
}
