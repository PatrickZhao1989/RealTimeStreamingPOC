interface BroadcastingPayload {
	Media: string
	CustomIdentifier: number
	ConnectionIndex: number
}

interface AdditionalOptions {
	CustomIdentifier: number
	ConnectionIndex: number
	useJsonPayload: boolean
}

export function transformChunkToPayload(
	chunk: Buffer,
	option: Partial<AdditionalOptions> | null = null
): string | Buffer {
	if (option?.useJsonPayload ?? false) {
		const broadCastingPayload: BroadcastingPayload = {
			CustomIdentifier: option?.CustomIdentifier ?? 10,
			ConnectionIndex: option?.ConnectionIndex ?? 1,
			Media: chunk.toString("base64"),
		}

		return JSON.stringify(broadCastingPayload)
	}

	return chunk
}
