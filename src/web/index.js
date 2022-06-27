window.addEventListener('DOMContentLoaded', (event) => {
	document.querySelector('#copy-to-clipboard').addEventListener('click', event => {
		navigator.clipboard.writeText(document.querySelector('#details').innerText)
	})

	const CACHE = new Map()

	function shorten(response) {
		return response.map(it => {
			if (it.text.includes('<span>')) {
				const name = it.text.replace(/<span>.*/, '')
				const value = it.text
						.replace(/^.*<span>/, '')
						.replace(/<\/span>$/, '')
				CACHE.set(it.id, value)
				const MAX_LENGTH = 60
				const truncatedValue = value.length > MAX_LENGTH + 3 ? `${value.substring(0, MAX_LENGTH)}...` : value
				it.text = `${name} <b>${truncatedValue}</b>`
			}
			it.children = shorten(it.children)
			return it
		})
	}

	function renderValue(value) {
		if (!value) {
			return "<i>no value</i>"
		}
		try {
			const parsedJson = JSON.parse(value)
			return JSON.stringify(parsedJson, null, 2)
		}
		catch (e) {
			return value
		}
	}

	fetch('/tree')
			.then(response => response.json())
			.then(response => {
				CACHE.clear()
				console.log(response)
				response = shorten(response)
				$('#tree').jstree({
					'core': {
						'data': response
					}
				}).on('changed.jstree', (e, data) => {
					console.log(data)
					const id = data.node.id
					const value = CACHE.get(id)
					document.querySelector('#details').innerHTML = renderValue(value)
				})
			})
})
