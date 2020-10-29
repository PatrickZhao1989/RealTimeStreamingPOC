interface BroadcastingPayload {
	Media: string
	AuctionId: number
	ConnectionIndex: number
}

interface AdditionalOptions {
	AuctionId: number
	ConnectionIndex: number
	useJsonPayload: boolean
}

export function transformChunkToPayload(
	chunk: Buffer,
	option: Partial<AdditionalOptions> | null = null
): string | Buffer {
	if (option?.useJsonPayload ?? false) {
		const broadCastingPayload: BroadcastingPayload = {
			AuctionId: option?.AuctionId ?? 10,
			ConnectionIndex: option?.ConnectionIndex ?? 1,
			Media: chunk.toString("base64"),
		}

		return JSON.stringify(broadCastingPayload)
	}

	return chunk
}
