let IGNORE_LIST = '';

window.onload = () => {
	const ignoreListElm = document.getElementById('ignoreList');
	const iconDiv = document.getElementById('iconDiv');
	const theme = document.getElementById('theme');

	if (ignoreListElm) {
		ignoreListElm.onchange = () => {
			IGNORE_LIST = ignoreListElm.value;
			updateDisplay();
			storeIgnoreList();
		};
	}


	const iconNames = [
		'download',
		'save'
	];
	const capitalize = (str) =>
		str.substring(0, 1).toUpperCase() + str.substring(1);
	for (iconName of iconNames) {
		const icon = document.createElement('img');
		icon.src = 'img/icon/' + iconName + '.png';
		icon.className = 'icon';

		const btn = document.createElement('button');
		btn.className = 'icon-btn';
		btn.title = capitalize(iconName);
		btn.id = iconName;

		btn.appendChild(icon);
		iconDiv.appendChild(btn);
	}

	// TODO -- make night mode look not terrible (update font color)
	// document.getElementById('night-mode').title = 'Night Mode';
	document.getElementById('download').title = 'Download Ignore List as Text File';
	document.getElementById('download').onclick = () => {
		ignoreListElm.focus();

		const s = 'Untitled';
		// https://stackoverflow.com/a/8485137/4907950
		const filename = s.replace(/[^a-z0-9]/gi, '_') + '.txt';

		const file = {
			url:
				'data:application/txt,' +
				encodeURIComponent(ignoreListElm.value.replace(/\r?\n/g, '\r\n')),
			filename: filename,
		};
		chrome.downloads.download(file);
	}
	document.getElementById('save').title = 'Save Ignore List';
	document.getElementById('save').onclick = () => {};
	// document.getElementById('night-mode').onclick = () => {
	// 	notesElm.focus();
	// 	if (theme.href.includes('day.css')) {
	// 		theme.href = 'css/night.css';
	// 		localStorage.setItem('nightData', 'true');
	// 	} else {
	// 		theme.href = 'css/day.css';
	// 		localStorage.setItem('nightData', 'false');
	// 	}
	// };

	if (localStorage) {
		
		// TODO -- can I avoid using *both* local storage and chrome local storage?
		// no clue how they differ...

		// load notes from storage and put in DOM and chrome local storage
		const ignoreListLocal = localStorage.getItem('ignoreList');
		if (ignoreListLocal !== null) {
			IGNORE_LIST = JSON.parse(ignoreListLocal);
			ignoreListElm.value = IGNORE_LIST;
			chrome.storage.local.set({ignoreList: ignoreListElm.value});
		}
		// load night
		// if (localStorage.getItem('nightData') === 'true') {
		// 	theme.href = 'css/night.css';
		// }
	}

	document.onkeydown = (evt) => {
		if (
			evt.key === 'n' &&
			ignoreListElm !== document.activeElement
		) {
			// document.getElementById('night-mode').onclick();
			ignoreListElm.blur();
		}
		storeSize();
	};

	// document.onmouseup = storeSize;
	storeSize();

	updateDisplay();
};

function storeSize() {
	if (localStorage) {
		const ignoreListElm = document.getElementById('ignoreList'); // quick fix for scope
		localStorage.setItem('noteWidth', ignoreListElm.clientWidth);
		localStorage.setItem('noteHeight', ignoreListElm.clientHeight);
	}
}

function storeIgnoreList() {
	if (localStorage) {
		localStorage.setItem('ignoreList', JSON.stringify(IGNORE_LIST));
	}
	chrome.storage.local.set({ignoreList: IGNORE_LIST});
}


function updateDisplay() {	

	const ignoreListElm = document.getElementById('ignoreList'); // quick fix for scope

	ignoreListElm.value = IGNORE_LIST;
	chrome.storage.local.set({ignoreList: ignoreListElm.value});

	storeIgnoreList();
}
