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
		if (!tag) {
			console.log('# Fetching tags for artist: ', a.artist)
			// fetch it and save in map
			tag = await fetch(
				`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${a.artist}&api_key=a014e53e73aba0fde3d38f1c5ec3c12b&format=json`
			)
				.then((r) => r.json())
				.then((json) => json.toptags.tag[0].name)
				.catch((reason) => {
					console.error('FAILED TO GET TAG FOR ARTIST: ' + a.artist)
					console.error('reason: ', JSON.stringify(reason))
				})
			tag_per_artist.set(a.artist, tag)
		}
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
