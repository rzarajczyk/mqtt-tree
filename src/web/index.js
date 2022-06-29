function addCopyToClipboardListener(triggerSelector, textSourceSelector) {
	document.querySelector(triggerSelector).addEventListener('click', event => {
		const text = document.querySelector(textSourceSelector).innerText
		navigator.clipboard.writeText(text)
		M.toast({html: `Content copied: ${text}`, displayLength: 1000})
	})
}

const CACHE = new Map()

function parse(response) {
	return response.map(it => {
		CACHE.set(it.id, it)
		if (it.value != null) {
			const MAX_LENGTH = 60
			const truncatedValue = it.value.length > MAX_LENGTH + 3 ? `${it.value.substring(0, MAX_LENGTH)}...` : it.value
			it.text = `${(it.name)} <b>${truncatedValue}</b>`
		}
		else {
			it.text = it.name
		}
		it.children = parse(it.children)
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

function refresh() {
	fetch('/tree')
			.then(response => response.json())
			.then(response => {
				CACHE.clear()
				console.log(response)
				const parsed = parse(response)
				$('#tree').jstree(true).settings.core.data = parsed
				$('#tree').jstree(true).refresh(true)
			})
}

window.addEventListener('DOMContentLoaded', (event) => {
	addCopyToClipboardListener('#copy-value-to-clipboard', '#node-value');
	addCopyToClipboardListener('#copy-name-to-clipboard', '#node-name span');
	addCopyToClipboardListener('#copy-path-to-clipboard', '#node-path span');
	$('#tree').jstree({core: {data: []}}).on('changed.jstree', (e, data) => {
		console.log(data)
		if (data.action == 'select_node') {
			const id = data.node.id
			const node = CACHE.get(id)
			document.querySelector('#node-value').innerHTML = renderValue(node.value)
			document.querySelector('#node-name span').innerHTML = node.name
			document.querySelector('#node-path span').innerHTML = node.path
		}
	})
	refresh()
	setInterval(refresh, 5000)
})
