import { import_data, import_tag_per_artist } from './import.js'

const IGNORED_TAGS = [null, 'seen live', 'musik um sich allein zu betrinken', 'dank']

async function main() {
	let data = await import_data()
	const tag_per_artist = import_tag_per_artist()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const tag_count_per_year = {}

	for (let i = 0; i < data.length; i++) {
		const scrobbl = data[i]
		if (+scrobbl.uts < 1321995200) {
			continue
		}
		let tag = tag_per_artist.get(scrobbl.artist)
		if (IGNORED_TAGS.includes(tag)) continue
		if (!tag_count_per_year[scrobbl.year]) tag_count_per_year[scrobbl.year] = []
		let tag_in_year = tag_count_per_year[scrobbl.year].find((i) => i.tag === tag)
		if (!tag_in_year) {
			tag_in_year = { tag, count: 0 }
			tag_count_per_year[scrobbl.year].push(tag_in_year)
		}
		tag_in_year.count++
	}

	for (const array of Object.values(tag_count_per_year)) {
		array.sort((a, b) => b.count - a.count)
		array.splice(30, array.length - 1)
	}

	const tag_set = new Set()
	for (const array of Object.values(tag_count_per_year)) {
		array.forEach(({ tag }) => {
			tag_set.add(tag)
		})
	}

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
