import { export_tag_per_artist, import_data, import_tag_per_artist } from './import.js'

async function main() {
	let data = await import_data()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const seen = new Set()
	const artists_each_year = []
	const tag_per_artist = import_tag_per_artist()

	for (let i = 0; i < data.length; i++) {
		const a = data[i]
		let count = 1
		const string_a = a.year + a.artist
		if (seen.has(string_a)) continue
		for (let j = i + 1; j < data.length; j++) {
			const b = data[j]
			if (a.year !== b.year) break
			const string_b = b.year + b.artist
			if (string_a === string_b) count++
		}
		let tag = tag_per_artist.get(a.artist)
		artists_each_year.push({ year: a.year, artist: a.artist, count, tag })
		seen.add(string_a)
	}

	export_tag_per_artist(tag_per_artist)

	console.log('year,artist,count,tag')
	for (const { year, artist, count, tag } of artists_each_year) {
		console.log([year, artist, count, tag].map((v) => `"${v}"`).join(','))
	}
}

main()
