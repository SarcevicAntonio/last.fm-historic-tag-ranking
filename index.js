const csv = require('csv-parser')
const fs = require('fs')

async function main() {
	const data = await import_data()
	console.log(data.at(-1))
}

function import_data() {
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

main()
