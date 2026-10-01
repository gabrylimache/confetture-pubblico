const eventName = document.querySelector('#event-name')
const eventMeta = document.querySelector('#event-meta')
const publicationKind = document.querySelector('#publication-kind')
const publicationTime = document.querySelector('#publication-time')
const musicianFilter = document.querySelector('#musician-filter')
const generalPdf = document.querySelector('#general-pdf')
const personalPdf = document.querySelector('#personal-pdf')
const message = document.querySelector('#site-message')
const setlist = document.querySelector('#setlist')

function makeElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function addLink(anchor, label, href) {
  anchor.textContent = label
  anchor.href = href
  anchor.hidden = false
}

function renderSlot(slot) {
  const item = makeElement('li', 'slot')
  const role = makeElement('span', 'slot-role', slot.display_name)
  const assigned = makeElement(
    'span',
    `slot-assignee slot-${slot.status}`,
    slot.musician ?? 'Da assegnare',
  )
  if (slot.status === 'tentative' && slot.musician) {
    assigned.textContent += '*'
    assigned.setAttribute('aria-label', `${slot.musician}, provvisorio`)
  }
  item.append(role, assigned)
  return item
}

function renderSong(song, selectedMusician) {
  const card = makeElement('article', 'song')
  const heading = makeElement('div', 'song-heading')
  const title = makeElement(
    'h2',
    'song-title',
    `${song.position}. ${song.title}`,
  )
  heading.append(title)
  if (song.tonality) {
    heading.append(makeElement('span', 'tonality', song.tonality))
  }
  card.append(heading)
  if (song.public_notes) {
    card.append(makeElement('p', 'song-notes', song.public_notes))
  }
  const slots = makeElement('ul', 'slots')
  const visibleSlots = selectedMusician
    ? song.slots.filter(
        (slot) =>
          slot.musician === selectedMusician || slot.status === 'open',
      )
    : song.slots
  visibleSlots.forEach((slot) => slots.append(renderSlot(slot)))
  card.append(slots)
  return card
}

function render(manifest) {
  eventName.textContent = manifest.confettura_name
  eventMeta.textContent = new Date(
    `${manifest.event_date}T00:00:00`,
  ).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const isOfficial = manifest.snapshot_kind === 'official'
  publicationKind.textContent = isOfficial ? 'Ufficiale' : 'Provvisoria'
  publicationKind.classList.toggle('official', isOfficial)
  publicationKind.classList.toggle('provisional', !isOfficial)
  const publishedDate = new Date(manifest.published_at)
  publicationTime.dateTime = manifest.published_at
  publicationTime.textContent = `Pubblicata il ${publishedDate.toLocaleString('it-IT')}`

  const names = [
    ...new Set(
      manifest.songs.flatMap((song) =>
        song.slots.flatMap((slot) => (slot.musician ? [slot.musician] : [])),
      ),
    ),
  ].sort((left, right) => left.localeCompare(right, 'it'))
  for (const name of names) {
    const option = makeElement('option', '', name)
    option.value = name
    musicianFilter.append(option)
  }
  musicianFilter.disabled = false

  if (manifest.pdfs?.general) {
    generalPdf.href = `./${manifest.pdfs.general}`
  }
  musicianFilter.addEventListener('change', () => {
    const name = musicianFilter.value
    const pdfPath = manifest.pdfs?.by_musician?.[name]
    if (name && pdfPath) {
      addLink(personalPdf, 'Scarica PDF personale', `./${pdfPath}`)
    } else {
      personalPdf.hidden = true
    }
    renderSongs(manifest, name)
  })
  message.hidden = true
  renderSongs(manifest, '')
}

function renderSongs(manifest, musician) {
  setlist.replaceChildren()
  const songs = musician
    ? manifest.songs.filter((song) =>
        song.slots.some((slot) => slot.musician === musician),
      )
    : manifest.songs
  for (const song of songs) setlist.append(renderSong(song, musician))
  if (!songs.length) {
    setlist.append(
      makeElement('p', 'message', 'Nessun brano per il filtro selezionato.'),
    )
  }
}

fetch('./data/latest.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  })
  .then(render)
  .catch(() => {
    message.textContent =
      'La scaletta non è ancora disponibile. Riprova più tardi.'
  })
