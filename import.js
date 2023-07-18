import csv from 'csv-parser'
import fs from 'node:fs'

export function import_data() {
	return new Promise((resolve, reject) => {
		let results = []
		fs.createReadStream('./scrobbles-Linkplay9-1689688285.csv')
			.pipe(csv())
			.on('data', (data) => {
				results.push(data)
			})
			.on('end', () => {
				resolve(results)
			})
			.on('error', (e) => {
				reject(e)
			})
	})
}
