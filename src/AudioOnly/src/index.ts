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
const DECODE_ON_CLIENT = true

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
	const decoder = new MulawDecoder()

	rs.on("data", (chunk: Buffer) => {
		const payload = DECODE_ON_CLIENT ? chunk : decoder.decodeBuffer(chunk)
		audioWssListener.clients.forEach((client) => {
			// send the client the current message
			client.send(
				transformChunkToPayload(payload, {
					CustomIdentifier: 10,
					ConnectionIndex: connIndex,
					useJsonPayload: USE_JSON_PAYLOAD,
				})
			)
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
	const decoder = new MulawDecoder()
	const bufferer = new AudioBufferer()
	const fileWriter = new FileWriter()

	let finalise = false
	fileWriter.enable = SAVE_PCM_FILE

	fileWriter.openFile(OUTPUT_FILE_NAME)

	bufferer.onDataReady = (buffer) => {
		console.log("Flushing buffer...")

		if (SAVE_PCM_FILE) {
			buffer.forEach((buf) => {
				// broadcastToClient(buf)
				const payload = DECODE_ON_CLIENT ? buf : decoder.decodeBuffer(buf)
				fileWriter.appendToFile(payload)
			})

			if (finalise) {
				fileWriter.close()
			}
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
				const payload = DECODE_ON_CLIENT ? bufferData : decoder.decodeBuffer(bufferData)
				broadcastToClient(payload)
				bufferer.pushData(payload)
				// console.log(`Receiving audio ... payload is ${JSON.stringify(msg.media)}`)
				// twilioListener.clients.forEach((client) => {
				// 	//send the client the current message
				// 	const broadCastingPayload = {
				// 		CustomIdentifier: 10,
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

app.get("/", (req, res) => {
	res.send("Hello world!")
})

//start the web server
server.listen(PORT, () => {
	console.log(`Websocket server started on port ` + PORT)
})
