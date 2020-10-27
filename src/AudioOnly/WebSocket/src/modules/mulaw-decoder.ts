import { mulaw } from "alawmulaw"

export class MulawDecoder {
	public decodeBuffer(data: Buffer): Buffer {
		return Buffer.from(mulaw.decode(data).buffer)
	}
}
