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
    label.style.float = 'left'
    label.style.marginTop = '.7em'
    label.style.marginRight = '1em'
    label.style.marginLeft = '1em'
    label.innerHTML = txt
    return label
}

function onScoreFilterChange (event) {
    var data = {
        type: 'TridentScore',
        text: event.target.value
    }
    window.postMessage(data, '*')
}

function onYearFilterChange (event) {
    var data = {
        type: 'TridentYear',
        text: event.target.value
    }
    window.postMessage(data, '*')
}

function onGenreFilterChange (event) {
    var data = {
        type: 'TridentGenre',
        text: event.target.value
    }
    window.postMessage(data, '*')
}

function createScoreFilterBox() {
    var box = document.createElement('input')
    box.style.width = '4em'
    box.type = 'number'
    box.style.display = 'block'
    box.style.float = 'left'
    box.id = 'score-filter'
    box.step = '0.5'
    box.max = '10'
    box.min = '0'
    box.value = '7.0'
    box.onchange = onScoreFilterChange
    return box
}

function createYearFilterBox() {
    var box = document.createElement('input')
    box.style.width = '4em'
    box.type = 'number'
    box.style.display = 'block'
    box.style.float = 'left'
    box.id = 'year-filter'
    box.step = '1'
    box.max = (new Date()).getFullYear() + 1
    box.min = '1900'
    box.value = (new Date()).getFullYear() - 1
    box.onchange = onYearFilterChange
    return box
}

function createGenreFilterBox() {
    var box = document.createElement('input')
    box.style.width = '4em'
    box.type = 'text'
    box.style.display = 'block'
    box.style.float = 'left'
    box.id = 'genre-filter'
    box.onchange = onGenreFilterChange
    return box
}

function insertFilterBoxes() {
    var container = document.createElement('div')
    container.id = 'trident-controls'
    var lblMinScore = makeLabel('min score:')
    var lblMinYear = makeLabel('min year:')
    var lblGenre = makeLabel('genre:')
    var scoreBox = createScoreFilterBox()
    var boxMinYear = createYearFilterBox()
    var boxGenre = createGenreFilterBox()
    var navs = document.getElementsByClassName('primary-nav')
    var nav = navs[navs.length - 1]
    container.appendChild(lblMinScore)
    container.appendChild(scoreBox)
    container.appendChild(lblMinYear)
    container.appendChild(boxMinYear)
    container.appendChild(lblGenre)
    container.appendChild(boxGenre)
    nav.appendChild(container)
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
