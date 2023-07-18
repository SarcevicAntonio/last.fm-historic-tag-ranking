import { import_data } from './import.js'

async function main() {
	const data = await import_data()
	console.log(data.at(-1))
}

main()
