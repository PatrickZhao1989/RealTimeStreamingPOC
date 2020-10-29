import fs from "fs"

export class FileWriter {
	private currentFileNum = -1

	public enable = true

	public openFile(filename: string): void {
		if (!this.enable) return

		if (this.currentFileNum >= 0) {
			this.close()
		}

		fs.open(filename, "w", (_, fileNumber) => {
			console.log(`File ${filename} opened`)
			this.currentFileNum = fileNumber
		})
	}

	appendToFile(buf: Uint8Array) {
		if (this.currentFileNum < 0) return

		fs.appendFileSync(this.currentFileNum, buf)
	}

	close() {
		if (this.currentFileNum < 0) return

		fs.close(this.currentFileNum, () => {
			console.log("File closed")
		})
		this.currentFileNum = -1
	}
}
