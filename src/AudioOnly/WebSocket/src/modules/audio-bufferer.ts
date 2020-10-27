const AUDIO_BUFFER_SIZE = 50

export class AudioBufferer {
	private buffer: Buffer[] = []
	private processingBuffer: Buffer[] = []

	constructor(
		public onDataReady?: (buffer: Buffer[]) => void,
		public onBufferWrite?: (buffer: Buffer) => Buffer,
		) {}

	public pushData(base64String: string): void {
		if (this.buffer.length < AUDIO_BUFFER_SIZE) {
			let data = Buffer.from(base64String, "base64")

			if (this.onBufferWrite) {
				data = this.onBufferWrite(data)
			}

			this.buffer.push(data)
			return
		}

		// Buffer full, kick the bucket
		this.flushBuffer()
	}

	public flushBuffer(): void {
		this.processingBuffer.push(...this.buffer)
		this.buffer = []

		if (this.onDataReady) {
			this.onDataReady(this.processingBuffer)
			this.processingBuffer.length = 0
		}
	}
}
