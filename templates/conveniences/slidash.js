/* slidash machinery — navigation only. Edit freely. */
(function () {
  'use strict'

  const slides = Array.from(document.querySelectorAll('.slide'))
  if (slides.length === 0) return

  const dotsWrap = document.getElementById('dots')
  const counterCurrent = document.getElementById('counterCurrent')
  const counterTotal = document.getElementById('counterTotal')
  const prevBtn = document.getElementById('prevBtn')
  const nextBtn = document.getElementById('nextBtn')

  let current = 0
  let step = 0

  const stepsOf = (i) => parseInt(slides[i].dataset.steps, 10) || 0

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button')
      dot.className = 'chrome__dot'
      dot.type = 'button'
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1))
      dot.addEventListener('click', () => goTo(i))
      dotsWrap.appendChild(dot)
    })
  }
  const dots = dotsWrap ? Array.from(dotsWrap.children) : []
  if (counterTotal) counterTotal.textContent = String(slides.length)

  // dataset.step exposes the exact step so CSS can target "== k", not just the
  // ">= k" that .is-revealed gives you.
  function applySteps(slide, s) {
    slide.dataset.step = String(s)
    slide.querySelectorAll('[data-step]').forEach((el) => {
      const k = parseInt(el.dataset.step, 10) || 0
      el.classList.toggle('is-revealed', s >= k)
    })
  }

  // Position lives in localStorage, NOT the URL hash: touching the hash would
  // reset the browser's per-URL zoom. Stored 1-based as "slide.step" (e.g. "2.1").
  // Namespaced by pathname so multiple decks opened over file:// (which share one
  // origin) don't clobber each other's position.
  const STORE_KEY = 'slidash:pos:' + location.pathname

  function readLocation() {
    let raw = null
    try {
      raw = localStorage.getItem(STORE_KEY)
    } catch (e) {
      return
    }
    const m = /^(\d+)(?:\.(\d+))?$/.exec(raw || '')
    if (!m) return
    const i = parseInt(m[1], 10) - 1
    if (i < 0 || i >= slides.length) return
    current = i
    const s = parseInt(m[2], 10) || 0
    step = Math.min(Math.max(s, 0), stepsOf(i))
  }

  function writeLocation() {
    try {
      localStorage.setItem(STORE_KEY, current + 1 + (step ? '.' + step : ''))
    } catch (e) {
      // no localStorage: position just won't persist
    }
  }

  function render() {
    writeLocation()
    slides.forEach((slide, i) => {
      const isActive = i === current
      slide.classList.toggle('is-active', isActive)
      if (isActive) applySteps(slide, step)
    })
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current))
    if (counterCurrent) counterCurrent.textContent = String(current + 1)
  }

  function goTo(i) {
    if (i < 0 || i >= slides.length) return
    current = i
    step = 0
    render()
  }

  function next() {
    if (step < stepsOf(current)) {
      step += 1
      render()
    } else if (current < slides.length - 1) {
      goTo(current + 1)
    }
  }

  function prev() {
    if (step > 0) {
      step -= 1
      render()
    } else if (current > 0) {
      current -= 1
      step = stepsOf(current)
      render()
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', next)
  if (prevBtn) prevBtn.addEventListener('click', prev)

  // Grid overview (key G). Built as machinery, not authored markup: the overlay
  // holds no content of yours, so slidash.js creates it rather than asking
  // index.html to carry an empty container.
  const gridOverlay = document.createElement('div')
  gridOverlay.className = 'grid-overlay'
  gridOverlay.hidden = true
  const gridEl = document.createElement('div')
  gridEl.className = 'grid'
  gridOverlay.appendChild(gridEl)
  document.body.appendChild(gridOverlay)

  let gridOpen = false
  let gridFocus = 0

  // Thumbnail step: the slide's last step by default; override per slide with
  // data-thumb-step (e.g. "0" to freeze a slide before its final reveal).
  const thumbStepOf = (i) => {
    const raw = slides[i].dataset.thumbStep
    return raw != null ? parseInt(raw, 10) || 0 : stepsOf(i)
  }

  // Each thumbnail is a clone rendered at window size inside a scaled stage, so
  // the slide's vw/vh resolve exactly as they do in the live presentation.
  function buildGrid() {
    const cellW = Math.max(200, Math.round(window.innerWidth * 0.18))
    const scale = cellW / window.innerWidth
    gridEl.style.setProperty('--cell-w', cellW + 'px')
    gridEl.style.setProperty('--cell-h', Math.round(window.innerHeight * scale) + 'px')
    gridEl.style.setProperty('--thumb-scale', String(scale))

    gridEl.textContent = ''
    slides.forEach((slide, i) => {
      const cell = document.createElement('div')
      cell.className = 'grid__cell' + (i === current ? ' is-current' : '')
      cell.setAttribute('role', 'button')
      cell.setAttribute('aria-label', 'Go to slide ' + (i + 1))

      const stage = document.createElement('div')
      stage.className = 'grid__stage'
      const clone = slide.cloneNode(true)
      clone.classList.remove('is-active')
      applySteps(clone, thumbStepOf(i))
      stage.appendChild(clone)

      const num = document.createElement('span')
      num.className = 'grid__num'
      num.textContent = String(i + 1)

      cell.appendChild(stage)
      cell.appendChild(num)
      cell.addEventListener('click', () => {
        goTo(i)
        closeGrid()
      })
      gridEl.appendChild(cell)
    })
  }

  function markFocus(i) {
    const cells = gridEl.children
    if (cells[gridFocus]) cells[gridFocus].classList.remove('is-current')
    gridFocus = Math.min(Math.max(i, 0), cells.length - 1)
    const cell = cells[gridFocus]
    if (cell) {
      cell.classList.add('is-current')
      cell.scrollIntoView({ block: 'nearest' })
    }
  }

  function openGrid() {
    buildGrid()
    gridOverlay.hidden = false
    gridOpen = true
    markFocus(current)
  }

  function closeGrid() {
    gridOverlay.hidden = true
    gridOpen = false
    gridEl.textContent = '' // release the clones
  }

  function toggleGrid() {
    if (gridOpen) closeGrid()
    else openGrid()
  }

  function handleGridKey(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        markFocus(gridFocus - 1)
        break
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault()
        markFocus(gridFocus + 1)
        break
      case 'Home':
        e.preventDefault()
        markFocus(0)
        break
      case 'End':
        e.preventDefault()
        markFocus(slides.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        goTo(gridFocus)
        closeGrid()
        break
      case 'Escape':
      case 'g':
      case 'G':
        e.preventDefault()
        closeGrid()
        break
    }
  }

  gridOverlay.addEventListener('click', (e) => {
    if (e.target === gridOverlay) closeGrid()
  })

  document.addEventListener('keydown', (e) => {
    // With the grid open, the keyboard drives it (the deck underneath stays put);
    // navigation only fires on Enter/click.
    if (gridOpen) {
      handleGridKey(e)
      return
    }
    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault()
      toggleGrid()
      return
    }
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault()
        next()
        break
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault()
        prev()
        break
      case 'Home':
        e.preventDefault()
        goTo(0)
        break
      case 'End':
        e.preventDefault()
        goTo(slides.length - 1)
        break
    }
  })

  readLocation()
  render()
})()
