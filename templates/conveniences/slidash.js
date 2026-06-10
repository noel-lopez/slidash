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
  const STORE_KEY = 'slidash:pos'

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

  document.addEventListener('keydown', (e) => {
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
