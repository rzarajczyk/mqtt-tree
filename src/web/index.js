window.addEventListener('DOMContentLoaded', (event) => {
	document.querySelector('#copy-value-to-clipboard').addEventListener('click', event => {
		navigator.clipboard.writeText(document.querySelector('#node-value').innerText)
		M.toast({html: 'Content copied!', displayLength: 1000})
	})
	document.querySelector('#copy-name-to-clipboard').addEventListener('click', event => {
		navigator.clipboard.writeText(document.querySelector('#node-name').innerText)
		M.toast({html: 'Content copied!', displayLength: 1000})
	})
	document.querySelector('#copy-path-to-clipboard').addEventListener('click', event => {
		navigator.clipboard.writeText(document.querySelector('#node-path').innerText)
		M.toast({html: 'Content copied!', displayLength: 1000})
	})

	const CACHE = new Map()

	function shorten(response) {
		return response.map(it => {
			CACHE.set(it.id, it)
			if (it.value != null) {
				const MAX_LENGTH = 60
				const truncatedValue = it.value.length > MAX_LENGTH + 3 ? `${it.value.substring(0, MAX_LENGTH)}...` : it.value
				it.text = `${(it.name)} <b>${truncatedValue}</b>`
			} else {
				it.text = it.name
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
					const node = CACHE.get(id)
					document.querySelector('#node-value').innerHTML = renderValue(node.value)
					document.querySelector('#node-name span').innerHTML = node.name
					document.querySelector('#node-path span').innerHTML = node.path
				})
			})
})
