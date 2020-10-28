import * as WebSocket from "ws"
import express from "express"
import http from "http"
import fs from "fs"
import { AudioBufferer } from "./modules/audio-bufferer"
import { MulawDecoder } from "./modules/mulaw-decoder"
import { TwilioMlStreamModel } from "./models/twilio-ml-stream.model"
import * as url from "url"
import cors from "cors"
import { FileWriter } from "./modules/file-writer"
import { transformChunkToPayload } from "./modules/package-transformer"
import { base64StringToBuffer } from "./modules/string.util"

const PORT = 3000
const OUTPUT_FILE_NAME = "./output-file/test-writing-false.pcm"
const SAVE_PCM_FILE = false
const USE_JSON_PAYLOAD = false

// Instantiate express server
const app = express()
const server = http.createServer(app)
const restApiRoute = express.Router()
const twilioListener = new WebSocket.Server({ noServer: true })
const audioWssListener = new WebSocket.Server({ noServer: true })

app.use(cors())
app.use("/audiostream", restApiRoute)

restApiRoute.get("/broadcast-sample", (req, res) => {
	const rs = fs.createReadStream("output-file/test-sample.ulaw", {
		emitClose: true,
		highWaterMark: 128 * 1024,
	})
	const connIndex = Math.floor(Math.random() * 1000)

	rs.on("data", (chunk: Buffer) => {
		audioWssListener.clients.forEach((client) => {
			// send the client the current message
			client.send(
				transformChunkToPayload(chunk, {
					AuctionId: 10,
					ConnectionIndex: connIndex,
					useJsonPayload: USE_JSON_PAYLOAD,
				})
			)
			// twilioListener.clients.forEach((client) => {
			// 	//send the client the current message
			// 	const broadCastingPayload = {
			// 		AuctionId: 10,
			// 		Media: msg.media,
			// 	}
			// 	client.send(JSON.stringify(broadCastingPayload))
			// })
		})
	})
	rs.on("close", () => {
		res.statusCode = 200
		res.send()
	})
})

server.on("upgrade", (request, socket, head) => {
	const pathname = url.parse(request.url).pathname

	if (pathname === "/audiowss") {
		audioWssListener.handleUpgrade(request, socket, head, function done(ws) {
			audioWssListener.emit("connection", ws, request)
		})
	} else if (pathname === "/") {
		twilioListener.handleUpgrade(request, socket, head, function done(ws) {
			twilioListener.emit("connection", ws, request)
		})
	} else {
		socket.destroy()
	}
})

audioWssListener.on("connection", (ws) => {
	console.log("A client connected to audio WSS")
})

twilioListener.on("connection", (ws) => {
	console.log("New connection initiated")

	const broadcastToClient = (buf: Buffer) => {
		const payload = transformChunkToPayload(buf, { useJsonPayload: USE_JSON_PAYLOAD })
		audioWssListener.clients.forEach((client) => {
			client.send(payload)
		})
	}

	// Setting up buffer + file save for testing
	// const decoder = new MulawDecoder()
	const bufferer = new AudioBufferer()
	const fileWriter = new FileWriter()

	let finalise = false
	fileWriter.enable = SAVE_PCM_FILE

	fileWriter.openFile(OUTPUT_FILE_NAME)

	// Commenting the below - decoding on FE instead of here
	// bufferer.onBufferWrite = (buffer) => decoder.decodeBuffer(buffer)
	bufferer.onDataReady = (buffer) => {
		console.log("Flushing buffer...")

		buffer.forEach((buf) => {
			// broadcastToClient(buf)

			fileWriter.appendToFile(buf)
		})

		if (finalise) {
			fileWriter.close()
		}
	}

	ws.on("message", (data: WebSocket.Data) => {
		const msg: TwilioMlStreamModel | { event: "connected" | "start" | "stop" } = JSON.parse(data as string)
		switch (msg.event) {
			case "connected":
				console.log(`A new call has connected.`)
				break
			case "start":
				console.log(`Starting media stream ${JSON.stringify(msg)}`)
				break
			case "media":
				const bufferData = base64StringToBuffer(msg.media.payload)
				broadcastToClient(bufferData)
				bufferer.pushData(bufferData)
				// console.log(`Receiving audio ... payload is ${JSON.stringify(msg.media)}`)
				// twilioListener.clients.forEach((client) => {
				// 	//send the client the current message
				// 	const broadCastingPayload = {
				// 		AuctionId: 10,
				// 		Media: msg.media,
				// 	}
				// 	client.send(JSON.stringify(broadCastingPayload))
				// })
				break
			case "stop":
				console.log(`Call has ended`)
				finalise = true
				bufferer.flushBuffer()
				break
			default:
				console.log(`Unknown data ${msg}`)
				break
		}
	})
})

// webSocketServer.on("connection", (socket: WebSocket) => {
// 	socket.on("message", (msg) => {
// 		const { event, ...message } = JSON.parse(msg as string)
// 		switch (event) {
// 			case "start":
// 				const streamSid = message.start.streamSid
// 				socket.wstream = fs.createWriteStream(__dirname + `/${Date.now()}.wav`, { encoding: "binary" })
// 				// This is a mu-law header for a WAV-file compatible with twilio format
// 				socket.wstream.write(
// 					Buffer.from([
// 						0x52,
// 						0x49,
// 						0x46,
// 						0x46,
// 						0x62,
// 						0xb8,
// 						0x00,
// 						0x00,
// 						0x57,
// 						0x41,
// 						0x56,
// 						0x45,
// 						0x66,
// 						0x6d,
// 						0x74,
// 						0x20,
// 						0x12,
// 						0x00,
// 						0x00,
// 						0x00,
// 						0x07,
// 						0x00,
// 						0x01,
// 						0x00,
// 						0x40,
// 						0x1f,
// 						0x00,
// 						0x00,
// 						0x80,
// 						0x3e,
// 						0x00,
// 						0x00,
// 						0x02,
// 						0x00,
// 						0x04,
// 						0x00,
// 						0x00,
// 						0x00,
// 						0x66,
// 						0x61,
// 						0x63,
// 						0x74,
// 						0x04,
// 						0x00,
// 						0x00,
// 						0x00,
// 						0xc5,
// 						0x5b,
// 						0x00,
// 						0x00,
// 						0x64,
// 						0x61,
// 						0x74,
// 						0x61,
// 						0x00,
// 						0x00,
// 						0x00,
// 						0x00, // Those last 4 bytes are the data length
// 					])
// 				)
// 				break
// 			case "media":
// 				// decode the base64-encoded data and write to stream
// 				socket.wstream.write(Buffer.from(message.media.payload, "base64"))
// 				break
// 			case "stop":
// 				// Now the only thing missing is to write the number of data bytes in the header
// 				socket.wstream.write("", () => {
// 					const fd = fs.openSync(socket.wstream.path, "r+") // `r+` mode is needed in order to write to arbitrary position
// 					let count = socket.wstream.bytesWritten
// 					count -= 58 // The header itself is 58 bytes long and we only want the data byte length
// 					console.log(count)
// 					fs.writeSync(
// 						fd,
// 						Buffer.from([count % 256, (count >> 8) % 256, (count >> 16) % 256, (count >> 24) % 256]),
// 						0,
// 						4, // Write 4 bytes
// 						54 // starts writing at byte 54 in the file
// 					)
// 				})
// 				break
// 		}
// 	})
// })

app.get("/", (req, res) => {
	res.send("Hello world!")
})

//start the web server
server.listen(PORT, () => {
	console.log(`Websocket server started on port ` + PORT)
})
