import { import_data, import_tag_per_artist } from './import.js'

async function main() {
	let data = await import_data()
	const tag_per_artist = import_tag_per_artist()

	for (let i = 0; i < data.length; i++) {
		const entry = data[i]
		entry.date = new Date(entry.uts * 1000)
		entry.year = entry.date.getFullYear()
	}

	const tag_count_each_year = {}

	for (let i = 0; i < data.length; i++) {
		const scrobbl = data[i]
		if (+scrobbl.uts < 1321995200) {
			continue
		}
		let tag = tag_per_artist.get(scrobbl.artist)
		if (!tag_count_each_year[tag]) tag_count_each_year[tag] = {}
		if (!tag_count_each_year[tag][scrobbl.year]) tag_count_each_year[tag][scrobbl.year] = 0
		tag_count_each_year[tag][scrobbl.year]++
	}

	console.log('tag,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023')
	for (const [tag, years_count] of Object.entries(tag_count_each_year)) {
		let row = [tag]

		for (const [year, count] of Object.entries(years_count)) {
			row[year - 2010] = count
		}

		row = Array.from(row, (v) => (v ? v : 0))
		console.log(row.map((v) => `"${v}"`).join(','))
	}
}

main()
