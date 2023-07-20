import { import_data } from './import.js'

async function main() {
	let data = await import_data()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const seen = new Set()

	for (let i = 0; i < data.length; i++) {
		const a = data[i]
		if (+a.uts < 1321995200) {
			continue
		}
		let count = 1
		const string_a = a.year + a.artist
		if (seen.has(string_a)) continue
		for (let j = i + 1; j < data.length; j++) {
			const b = data[j]
			if (a.year !== b.year) break
			const string_b = b.year + b.artist
			if (string_a === string_b) count++
		}
		a.count = count
		seen.add(string_a)
	}

	data = data.filter((a) => !!a.count)

	data = data.sort((a, b) => {
		if (a.year === b.year) return b.count - a.count
		return b.year - a.year
	})

	const top_per_year = []
	let year = data[0].year
	let count = 0
	for (const entry of data) {
		if (entry.year === year && count < 10) {
			count++
			top_per_year.push({
				year: entry.year,
				count: entry.count,
				artist: entry.artist,
				track: entry.track,
			})
		} else if (entry.year !== year) {
			year = entry.year
			count = 0
			count++
			top_per_year.push({
				year: entry.year,
				count: entry.count,
				artist: entry.artist,
				track: entry.track,
			})
		} else {
			continue
		}
	}

	console.log('year,count,artist')
	for (const { year, count, artist } of top_per_year) {
		console.log([year, count, artist].map((v) => `"${v}"`).join(','))
	}
}

main()
