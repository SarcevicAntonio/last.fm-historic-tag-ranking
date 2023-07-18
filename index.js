import { import_data } from './import.js'

async function main() {
	const data = await import_data()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.day = entry.date.toLocaleDateString()
	}

	const seen = new Set()

	for (let i = 0; i < data.length; i++) {
		const a = data[i]
		if (+a.uts < 1321995200) {
			continue
		}
		let count = 1
		const string_a = a.day + a.artist + a.track
		if (seen.has(string_a)) continue
		for (let j = i + 1; j < data.length; j++) {
			const b = data[j]
			if (a.day !== b.day) break
			const string_b = b.day + b.artist + b.track
			if (string_a === string_b) count++
		}
		a.count = count
		seen.add(string_a)
	}

	const obsessions = []
	for (const entry of data) {
		if (entry.count >= 10)
			obsessions.push({
				day: entry.day,
				count: entry.count,
				artist: entry.artist,
				track: entry.track,
			})
	}

	// console.log(obsessions)
	console.log('day,count,artist,track')
	for (const { day, count, artist, track } of obsessions) {
		console.log([day, count, artist, track].map((v) => `"${v}"`).join(','))
	}
}

main()
