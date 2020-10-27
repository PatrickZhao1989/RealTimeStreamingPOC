export interface TwilioMlStreamModel {
	event: "media"
	sequenceNumber: string
	media: {
		track: "inbound" | "outbound"
		chunk: string
		timestamp: string
		payload: string
	}
	streamSid: string
}
