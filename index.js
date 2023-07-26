import { export_tag_per_artist, import_data, import_tag_per_artist } from './import.js'

// configuration
const SCROBBLES_CSV = './scrobbles-Linkplay9-1689688285.csv'
const NUMBER_TOP_TAGS = 30
const FETCH_TAGS = true
const IGNORED_TAGS = [
	null,
	'seen live',
	'musik um sich allein zu betrinken',
	'dank',
	'boy der am block chillt',
	'horses and ponies and unicorns too',
	'countries and continents',
	'favorites',
]

async function main() {
	console.warn('importing local data')
	let data = await import_data(SCROBBLES_CSV)
	const tag_per_artist = import_tag_per_artist()

	console.warn('converting dates')
	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const tag_count_per_year = {}

	console.warn('searching tags')
	for (let i = 0; i < data.length; i++) {
		const scrobbl = data[i]
		// this removes weird data i don't recognize
		if (+scrobbl.uts < 1321995200) {
			continue
		}
		let tag = tag_per_artist.get(scrobbl.artist)
		if (FETCH_TAGS && (!tag || IGNORED_TAGS.includes(tag)) && tag != null) {
			console.warn('# Fetching tags for artist: ', scrobbl.artist)
			const tags = await fetch(
				`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${scrobbl.artist}&api_key=a014e53e73aba0fde3d38f1c5ec3c12b&format=json`
			)
				.then(async (r) => {
					const json = await r.json()
					if (json.error) throw json
					return json.toptags.tag
				})
				.catch((reason) => {
					console.error('FAILED TO GET TAG FOR ARTIST: ' + scrobbl.artist)
					console.error('reason: ', JSON.stringify(reason))
					return []
				})

			for (let tag_i = 0; tag_i < tags.length; tag_i++) {
				tag = tags[tag_i].name
				if (!IGNORED_TAGS.includes(tag)) break
			}

			console.warn(tag)
			if (tag && (tag.toLowerCase() === 'hip hop' || tag.toLowerCase() === 'rap')) tag = 'Hip-Hop'
			tag_per_artist.set(scrobbl.artist, tag)
			export_tag_per_artist(tag_per_artist)
		}

		if (tag && (tag.toLowerCase() === 'hip hop' || tag.toLowerCase() === 'rap')) tag = 'Hip-Hop'

		if (IGNORED_TAGS.includes(tag)) continue

		if (!tag_count_per_year[scrobbl.year]) tag_count_per_year[scrobbl.year] = []
		let tag_in_year = tag_count_per_year[scrobbl.year].find((i) => i.tag === tag)
		if (!tag_in_year) {
			tag_in_year = { tag, count: 0 }
			tag_count_per_year[scrobbl.year].push(tag_in_year)
		}
		tag_in_year.count++
	}

	console.warn('getting top tags')
	for (const array of Object.values(tag_count_per_year)) {
		array.sort((a, b) => b.count - a.count)
		array.splice(NUMBER_TOP_TAGS, array.length - 1)
	}

	console.warn('selecting unique tags')
	const tag_set = new Set()
	for (const array of Object.values(tag_count_per_year)) {
		array.forEach(({ tag }) => {
			tag_set.add(tag)
		})
	}

	console.warn('printing ranking')
	console.log('tag,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023')
	for (const tag of [...tag_set]) {
		const row = [tag]
		for (let year = 2011; year <= 2023; year++) {
			const index = tag_count_per_year[year].findIndex((i) => i.tag === tag)
			if (index === -1) {
				row.push('')
			} else {
				row.push(index + 1)
			}
		}
		console.log(row.map((v) => `"${v}"`).join(','))
	}
}

main()
