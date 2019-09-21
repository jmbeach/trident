const storageKeyTridentPfMinScore = 'tridentpf-min-score'
const storageKeyTridentPfMinYear = 'tridentpf-min-year'
function onPlayerReady(event) {
    event.target.playVideo()
    setTimeout(function() {
        event.target.seekTo(0)
    }, 1000)
}

function makePlayer(id) {
    new YT.Player('player', {
        height: 80,
        width: 340,
        videoId: id,
        events: {
            onReady: onPlayerReady,
        },
    })
}

function makeLabel(txt) {
    var label = document.createElement('span')
    label.style.color = 'white'
    label.style.marginLeft = '10px'
    label.innerHTML = txt
    return label
}

function onScoreFilterChange (event) {
    var data = {
        type: 'TridentScore',
        text: event.target.value
    }

    localStorage.setItem(storageKeyTridentPfMinScore, event.target.value)

    window.postMessage(data, '*')
}

function onYearFilterChange (event) {
    var data = {
        type: 'TridentYear',
        text: event.target.value
    }

    localStorage.setItem(storageKeyTridentPfMinYear, event.target.value)

    window.postMessage(data, '*')
}

function onNextAlbumBtnClick (event) {
    var data = {
        type: 'NextAlbum'
    }

    window.postMessage(data, '*')
}

function onPreviousAlbumBtnClick (event) {
    var data = {
        type: 'PreviousAlbum'
    }

    window.postMessage(data, '*')
}

function createNextAlbumButton() {
	var button = document.createElement('input')
	button.setAttribute('type', 'button')
	button.value = '>'
	button.style.position = 'fixed'
	button.style.right = '1.5em'
	button.style.width = '1.5em'
	button.style.height = '1.2em'
	button.style.backgroundColor = '#1a1a1a'
	button.style.color = '#595959'
	button.style.font = '4.2em "Arial", sans-serif'
	button.style.top = '3.3em'
	button.style.border = 'none'
	button.style.zIndex = '100'
  button.setAttribute('title', 'Go to next review')
  button.onclick = onNextAlbumBtnClick
	return button
}

function createPreviousAlbumButton() {
    var button = document.createElement('input')
    button.setAttribute('type', 'button')
    button.value = '<'
    button.style.position = 'fixed'
    button.style.right = '1.5em'
    button.style.width = '1.5em'
    button.style.height = '1.2em'
    button.style.backgroundColor = '#1a1a1a'
    button.style.color = '#595959'
    button.style.font = '4.2em "Arial", sans-serif'
    button.style.top = '2em'
    button.style.border = 'none'
    button.style.zIndex = '100'
    button.setAttribute('title', 'Go to previous review')
    button.onclick = onPreviousAlbumBtnClick
    return button
}

function createScoreFilterBox() {
    var box = document.createElement('input')
    box.style.width = '33px'
    box.style.paddingLeft = '4px'
    box.style.border = '1px solid black'
    box.style.borderRadius = '4px'
    box.style.marginLeft = '5px'
    box.type = 'number'
    box.style.display = 'block'
    box.id = 'score-filter'
    box.step = '0.5'
    box.max = '10'
    box.min = '0'
    let minScore = localStorage.getItem(storageKeyTridentPfMinScore)
    if (!minScore)
    {
        minScore = '7.0'
        localStorage.setItem(storageKeyTridentPfMinScore, minScore)
    }

    box.value = minScore
    box.onchange = onScoreFilterChange
    return box
}

function createYearFilterBox() {
    var box = document.createElement('input')
    box.style.width = '44px'
    box.style.paddingLeft = '4px'
    box.style.marginLeft = '5px'
    box.style.border = '1px solid black'
    box.style.borderRadius = '4px'
    box.type = 'number'
    box.style.display = 'block'
    box.style.float = 'left'
    box.id = 'year-filter'
    box.step = '1'
    box.max = (new Date()).getFullYear() + 1
    box.min = '1900'
    let minYear = localStorage.getItem(storageKeyTridentPfMinYear)
    if (!minYear)
    {
        minYear = (new Date()).getFullYear() - 1
        localStorage.setItem(storageKeyTridentPfMinYear, minYear)
    }

    box.value = minYear
    box.onchange = onYearFilterChange
    return box
}

function insertFilterBoxes() {
    var container = document.createElement('div')
    container.id = 'trident-controls'
    container.style.display = 'flex'
    container.style.justifyContent = 'flex-start'
    container.style.alignItems = 'center'
    container.style.paddingBottom = '5px'
    var lblMinScore = makeLabel('min score:')
    var lblMinYear = makeLabel('min year:')
    var scoreBox = createScoreFilterBox()
    var boxMinYear = createYearFilterBox()
    var navs = document.getElementsByClassName('primary-nav')
    var nav = navs[navs.length - 1]
    container.appendChild(lblMinScore)
    container.appendChild(scoreBox)
    container.appendChild(lblMinYear)
    container.appendChild(boxMinYear)
    nav.appendChild(container)
}

function insertReviewControls() {
    var container = document.getElementsByClassName('infinite-container')
    container[0].children[0].appendChild(createNextAlbumButton())
    container[0].children[0].appendChild(createPreviousAlbumButton())
}

function insertPublishedYear(link, publishedYear) {
    var album = document.querySelector('.review__link[href*="' + link + '"]')
    var yearToInsert = document.createElement('span')
    yearToInsert.classList.add('pub-date', 'actual-date')
    yearToInsert.innerHTML = 'Published: ' + publishedYear
    var meta = album.nextElementSibling
    meta.append(yearToInsert)
}

function insertScore(link, score) {
    var album = document.querySelector('.review__link[href*="' + link + '"]')
    var scoreToInsert = document.createElement('span')
    scoreToInsert.classList.add('pub-date', 'actual-date')
    scoreToInsert.innerHTML = 'Score: ' + score
    var meta = album.nextElementSibling
    meta.append(scoreToInsert)
}

function filterAlbum(link) {
    var album = document.querySelectorAll('a[href="' + link + '"]')
    album[0].parentNode.style.display = 'none'
}

function unFilterAlbum(link) {
    var album = document.querySelectorAll('a[href="' + link + '"]')
    album[0].parentNode.style.display = 'block'
}

function destroyFilterControls() {
    var controls = document.getElementById('trident-controls')
    controls.parentNode.removeChild(controls)
}

function scrollToBottom() {
    var container = document.getElementsByClassName('infinite-container')[0]
    window.scroll(0, container.scrollHeight)
    setTimeout(function() {
      var links = document.querySelectorAll('.artist-links > li:first-child > a');
      var latest = links[links.length - 1]
        .parentElement
        .parentElement
        .parentElement
        .parentElement
        .parentElement
        .parentElement
        .parentElement
        .parentElement
      latest.scrollIntoView()
    }, 2000)
}
