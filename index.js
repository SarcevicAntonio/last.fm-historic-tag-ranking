import { import_data } from './import.js'

async function main() {
	let data = await import_data()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const seen = new Set()

	const artists_each_year = []

	for (let i = 0; i < data.length; i++) {
		const a = data[i]
		const string_a = a.year + a.artist
		if (seen.has(string_a)) continue
		artists_each_year.push({ year: a.year, artist: a.artist })
		seen.add(string_a)
	}

	artists_each_year.sort((a, b) => a.year - b.year)

	const years_and_counts = {}
	const old_artists = new Set()

	for (const { artist, year } of artists_each_year) {
		if (!years_and_counts[year]) years_and_counts[year] = { old_artist: 0, new_artist: 0 }
		if (old_artists.has(artist)) {
			years_and_counts[year]['old_artist']++
		} else {
			years_and_counts[year]['new_artist']++
			old_artists.add(artist)
		}
	}

	console.log('year,old_artist,new_artist')
	for (const [year, { old_artist, new_artist }] of Object.entries(years_and_counts)) {
		console.log([year, old_artist, new_artist].map((v) => `"${v}"`).join(','))
	}
}

main()
