const DEFAULT_AUDIO_BUFFER_SIZE = 50

export class AudioBufferer {
	private buffer: Buffer[] = []
	private processingBuffer: Buffer[] = []

	public onDataReady?: (buffer: Buffer[]) => void
	public onBufferWrite?: (buffer: Buffer) => Buffer

	constructor(private bufferSize = DEFAULT_AUDIO_BUFFER_SIZE) {}

	public pushData(base64String: string): void {
		let data = Buffer.from(base64String, "base64")

		if (this.onBufferWrite) {
			data = this.onBufferWrite(data)
		}

		this.buffer.push(data)

		if (this.buffer.length >= this.bufferSize) {
			// Buffer full, kick the bucket
			this.flushBuffer()
		}
	}

	public flushBuffer(): void {
		this.processingBuffer = this.buffer
		this.buffer = []

		if (this.onDataReady) {
			this.onDataReady(this.processingBuffer)
		}
	}
}
