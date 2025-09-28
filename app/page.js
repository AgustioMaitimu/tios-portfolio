'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // --- THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle')
    const sunIcon = document.getElementById('theme-icon-sun')
    const moonIcon = document.getElementById('theme-icon-moon')

    const applyTheme = (theme) => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        sunIcon?.classList.add('hidden')
        moonIcon?.classList.remove('hidden')
      } else {
        document.documentElement.classList.remove('dark')
        sunIcon?.classList.remove('hidden')
        moonIcon?.classList.add('hidden')
      }
    }

    const savedTheme =
      (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'dark'
    applyTheme(savedTheme)

    const onThemeClick = () => {
      const currentTheme = document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', newTheme)
      } catch {}
      applyTheme(newTheme)
    }
    themeToggleBtn?.addEventListener('click', onThemeClick)

    // --- START AT TOP ON REFRESH ---
    try {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      // Remove any hash without changing history length
      if (window.location.hash) {
        history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        )
      }
    } catch {}
    // Ensure initial position at top
    window.scrollTo({ top: 0, behavior: 'auto' })

    // --- TIME UPDATE LOGIC ---
    function updateTime() {
      const timeElement = document.getElementById('local-time')
      if (timeElement) {
        const now = new Date()
        timeElement.textContent =
          now.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Makassar',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }) + ' (Central Indonesia Time)'
      }
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // --- TYPEWRITER LOGIC ---
    const headline = document.getElementById('headline')
    let typewriterObserver = null
    if (headline) {
      typewriterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startTypewriter(headline)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.8 },
      )
      typewriterObserver.observe(headline)
    }

    function startTypewriter(container) {
      const line1El = container.querySelector('.line-1')
      const line2El = container.querySelector('.line-2')
      const line1Text = 'Swift Developer'
      const line2Text = 'Building for Apple Platforms.'
      const cursor = document.createElement('span')
      cursor.className = 'typing-cursor'

      line1El.appendChild(cursor)
      cursor.classList.add('is-blinking')

      const type = (element, text, callback) => {
        element.textContent = ''
        element.appendChild(cursor)
        let i = 0
        const typeCharacter = () => {
          if (i < text.length) {
            element.insertBefore(
              document.createTextNode(text.charAt(i)),
              cursor,
            )
            i++
            const delay = i <= 3 ? 80 : 35
            setTimeout(typeCharacter, delay)
          } else {
            if (callback) callback()
          }
        }
        typeCharacter()
      }

      setTimeout(() => {
        cursor.classList.remove('is-blinking')
        type(line1El, line1Text, () => {
          cursor.classList.add('is-blinking')
          setTimeout(() => {
            cursor.classList.remove('is-blinking')
            line2El.appendChild(cursor)
            type(line2El, line2Text, () => {
              cursor.classList.add('is-blinking')
            })
          }, 250)
        })
      }, 500)
    }

    // --- FADE-IN ON SCROLL LOGIC ---
    const observerOptions = {
      root: null,
      // Trigger a bit earlier (closer to the sample behavior)
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.15,
    }
    const lateObserverOptions = {
      root: null,
      // Projects: still later than default, but earlier than before
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.22,
    }
    let lastScrollY = window.scrollY
    let scrollDir = 'down'

    const fadeInObserver = new IntersectionObserver((entries) => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (scrollDir === 'up') {
            entry.target.classList.add('fade-in-no-anim')
          } else {
            entry.target.classList.remove('fade-in-no-anim')
          }
          entry.target.classList.add('is-visible')
        } else {
          // Only reset once element is fully offscreen (hysteresis to avoid early disappear)
          const rect = entry.boundingClientRect
          if (rect.bottom <= 0 || rect.top >= vh) {
            entry.target.classList.remove('is-visible')
            entry.target.classList.remove('fade-in-no-anim')
          }
        }
      })
    }, observerOptions)
    const lateObserver = new IntersectionObserver((entries) => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (scrollDir === 'up') {
            entry.target.classList.add('fade-in-no-anim')
          } else {
            entry.target.classList.remove('fade-in-no-anim')
          }
          entry.target.classList.add('is-visible')
        } else {
          const rect = entry.boundingClientRect
          if (rect.bottom <= 0 || rect.top >= vh) {
            entry.target.classList.remove('is-visible')
            entry.target.classList.remove('fade-in-no-anim')
          }
        }
      })
    }, lateObserverOptions)
    const fadeTargets = Array.from(
      document.querySelectorAll('.fade-in-element:not(.fade-late)'),
    )
    const lateTargets = Array.from(
      document.querySelectorAll('.fade-in-element.fade-late'),
    )
    fadeTargets.forEach((el) => fadeInObserver.observe(el))
    lateTargets.forEach((el) => lateObserver.observe(el))

    // Prime any elements already in view (more conservative near bottom)
    const primeFadeIns = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      fadeTargets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < vh * 0.85 && rect.bottom > 0) {
          el.classList.add('fade-in-no-anim')
          el.classList.add('is-visible')
        }
      })
      // Late targets are typically below the fold; do not pre-prime unless clearly in view
      lateTargets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < vh * 0.8 && rect.bottom > 0) {
          el.classList.add('fade-in-no-anim')
          el.classList.add('is-visible')
        }
      })
    }
    requestAnimationFrame(primeFadeIns)

    // Ensure bottom-of-page elements (e.g., footer) don't miss animation triggers
    const ensureBottomVisible = () => {
      const bottomTolerance = 120 // px near bottom
      const vh = window.innerHeight || document.documentElement.clientHeight
      const isNearBottom =
        window.scrollY + vh >=
        document.documentElement.scrollHeight - bottomTolerance
      if (!isNearBottom) return
      const allTargets = fadeTargets.concat(lateTargets)
      allTargets.forEach((el) => {
        if (el.classList.contains('is-visible')) return
        const rect = el.getBoundingClientRect()
        // Only pull in elements that are within 120px below the viewport (avoid global pre-trigger)
        if (rect.top < vh + 120 && rect.bottom > 0) {
          el.classList.add('is-visible')
        }
      })
    }

    // Reset animations when items are well offscreen so they can replay on re-entry
    const resetOffscreenAnimations = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      const tolerance = 80 // px beyond viewport to consider "reset-ready"
      const allTargets = fadeTargets.concat(lateTargets)
      allTargets.forEach((el) => {
        if (!el.classList.contains('is-visible')) return
        const rect = el.getBoundingClientRect()
        const fullyAbove = rect.bottom <= -tolerance
        const fullyBelow = rect.top >= vh + tolerance
        if (fullyAbove || fullyBelow) {
          el.classList.remove('is-visible')
        }
      })
    }

    // Contact stagger uses inline transition-delay on each element.

    // --- ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('section[id]')
    const navLinks = document.querySelectorAll('#pill-nav a')
    const updateActiveNav = () => {
      let currentSectionId = ''
      const isAtTop = window.scrollY <= 2
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50
      if (isAtTop) {
        const first = sections[0]
        if (first) currentSectionId = first.id // Highlight About at top
      } else if (isAtBottom) {
        const last = sections[sections.length - 1]
        if (last) currentSectionId = last.id
      } else {
        const scrollPosition = window.scrollY + window.innerHeight / 3
        sections.forEach((section) => {
          if (section.offsetTop <= scrollPosition) {
            currentSectionId = section.id
          }
        })
        // Fallback: if nothing matched yet (between header and About), highlight the first section
        if (!currentSectionId && sections[0]) {
          currentSectionId = sections[0].id
        }
      }
      navLinks.forEach((link) => {
        link.classList.remove('active-nav-link')
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active-nav-link')
        }
      })
    }
    const onScroll = () =>
      window.requestAnimationFrame(() => {
        const y = window.scrollY
        if (y > lastScrollY) scrollDir = 'down'
        else if (y < lastScrollY) scrollDir = 'up'
        lastScrollY = y

        updateActiveNav()
        resetOffscreenAnimations()
        ensureBottomVisible()
      })
    window.addEventListener('scroll', onScroll, { passive: true })
    updateActiveNav()

    // --- INTERCEPT NAV CLICKS (don’t set URL hash) ---
    const nav = document.getElementById('pill-nav')
    const onNavClick = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      const link = t.closest('#pill-nav a[href^="#"]')
      if (!link) return
      e.preventDefault()
      const href = link.getAttribute('href')
      if (!href) return
      const id = href.slice(1)
      if (!id || id === 'about') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(id)
      if (!el) return
      const rectTop = el.getBoundingClientRect().top + window.scrollY
      let smt = parseFloat(
        getComputedStyle(el).getPropertyValue('scroll-margin-top') || '0',
      )
      if (isNaN(smt)) smt = 0
      window.scrollTo({ top: Math.max(0, rectTop - smt), behavior: 'smooth' })
    }
    nav?.addEventListener('click', onNavClick)

    return () => {
      clearInterval(timeInterval)
      themeToggleBtn?.removeEventListener('click', onThemeClick)
      fadeInObserver.disconnect()
      typewriterObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      nav?.removeEventListener('click', onNavClick)
    }
  }, [])

  return (
    <>
      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-6 md:px-8 md:py-16">
        <div className="space-y-24 md:space-y-32">
          {/* Introduction Section */}
          <section className="pt-10 text-left md:pt-16">
            <h1
              id="intro-trigger"
              className="text-accent text-base font-semibold tracking-widest uppercase"
            >
              Agustio Joshua Maitimu
            </h1>
            <p
              id="headline"
              className="text-strong relative mt-4 text-5xl leading-none font-extrabold tracking-tighter md:text-7xl"
            >
              <span className="line-1"></span>
              <br />
              <span className="text-light line-2"></span>
            </p>
            <p className="text-light mt-6 max-w-2xl text-lg">
              Based in Bali, Indonesia. Currently honing my craft at the Apple
              Developer Academy @BINUS - Bali.
            </p>
          </section>

          {/* About & Experience Section */}
          <section id="about" className="scroll-mt-28">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container">
                  <h2 className="text-strong text-2xl font-bold tracking-tight">
                    About Me
                  </h2>
                </div>
              </div>
              <div className="space-y-8 sm:space-y-12 md:col-span-2">
                <p className="text-main text-lg leading-relaxed">
                  I build apps for the Apple ecosystem with experience in
                  frontend and backend development, collaborative GitHub
                  workflows, and shipping multiple apps to the App Store. I have
                  worked in multicultural, cross-functional teams and applied
                  design thinking, accessibility, and a user-centered mindset to
                  deliver products in fast-paced, iterative cycles.
                </p>
                <div>
                  <h3 className="text-strong font-semibold">
                    Apple Developer Academy @BINUS - Bali
                  </h3>
                  <p className="text-light mt-0.5 text-sm">Mar – Dec 2025</p>
                  <p className="text-light mt-1">
                    Enrolled in a 10-month program learning Apple ecosystem
                    development, design thinking, and professional skills.
                    Delivered multiple App Store-published apps in multicultural
                    teams, contributing across frontend (SwiftUI, widgets) and
                    backend (persistence, integrations), while maintaining
                    GitHub repo health.
                  </p>
                </div>
                <div>
                  <h3 className="text-strong font-semibold">
                    Self-Directed Learning
                  </h3>
                  <p className="text-light mt-0.5 text-sm">
                    Aug 2023 – Oct 2024
                  </p>
                  <p className="text-light mt-1">
                    Self-taught in frontend web development with React, Next.js,
                    Tailwind CSS, and GitHub workflows. Built and deployed
                    responsive apps on Vercel, including a dedicated frontend
                    development portfolio site.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="rule"></div>

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-28">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container fade-in-element">
                  <h2 className="reveal-text text-strong text-2xl font-bold tracking-tight">
                    Selected Work
                  </h2>
                </div>
              </div>
              <div className="space-y-20 md:col-span-2">
                {/* Project 1 */}
                <a
                  href="/projects/keepsake"
                  className="group project-card fade-in-element fade-late block"
                  style={{ ['--fade-delay']: '0ms' }}
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 h-auto w-full bg-gray-700 transition-transform duration-300 ease-in-out"></div>
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="text-strong flex items-center text-lg font-semibold">
                      Keepsake
                      <span className="text-light project-arrow ml-2">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-light text-sm">May – Jun 2025</p>
                    <p className="text-main mt-2">
                      An iOS camera app that uses customizable Home Screen
                      widgets to organize photos into specific, per-widget
                      albums.
                    </p>
                  </div>
                </a>

                {/* Project 2 */}
                <a
                  href="/projects/keepsake"
                  className="group project-card fade-in-element fade-late block"
                  style={{ ['--fade-delay']: '100ms' }}
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 h-auto w-full bg-gray-700 transition-transform duration-300 ease-in-out"></div>
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="text-strong flex items-center text-lg font-semibold">
                      SwiSekai
                      <span className="text-light project-arrow ml-2">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-light text-sm">Jul – Aug 2025</p>
                    <p className="text-main mt-2">
                      A macOS learning platform that teaches Swift.
                    </p>
                  </div>
                </a>

                {/* Project 3 */}
                <a
                  href="/projects/keepsake"
                  className="group project-card fade-in-element fade-late block"
                  style={{ ['--fade-delay']: '200ms' }}
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 h-auto w-full bg-gray-700 transition-transform duration-300 ease-in-out"></div>
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="text-strong flex items-center text-lg font-semibold">
                      Memmy
                      <span className="text-light project-arrow ml-2">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-light text-sm">Apr – May 2025</p>
                    <p className="text-main mt-2">
                      A solo-developed iOS checklist app with a configurable
                      Home Screen widget for glanceable information and quick
                      access.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </section>

          <div className="rule"></div>

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-28 pt-16 text-center">
            <h2
              className="text-strong fade-in-element text-3xl font-bold tracking-tighter md:text-4xl"
              style={{ ['--fade-delay']: '0ms' }}
            >
              Let&apos;s Connect
            </h2>
            <p
              className="text-light fade-in-element mx-auto mt-4 max-w-xl text-lg"
              style={{ ['--fade-delay']: '100ms' }}
            >
              Have a project in mind or just want to say hello? I&apos;d love to
              hear from you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-base font-medium">
              <a
                href="mailto:agustiomaitimu.apple@gmail.com"
                className="group text-main link-underline fade-in-element inline-block"
                style={{ ['--fade-delay']: '200ms' }}
              >
                <span
                  className="bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-all duration-300 ease-out group-hover:bg-[length:100%_1px]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, var(--accent-color), var(--accent-color))',
                  }}
                >
                  agustiomaitimu.apple@gmail.com
                </span>
              </a>
              <span
                className="fade-in-element hidden text-gray-300 sm:block dark:text-gray-700"
                style={{ ['--fade-delay']: '300ms' }}
              >
                ·
              </span>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-main link-underline fade-in-element inline-block"
                style={{ ['--fade-delay']: '400ms' }}
              >
                <span
                  className="bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-all duration-300 ease-out group-hover:bg-[length:100%_1px]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, var(--accent-color), var(--accent-color))',
                  }}
                >
                  Download Résumé
                </span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-24 max-w-5xl p-6 pb-32 md:mt-32 md:px-8">
        <div className="border-t border-gray-200 pt-8 text-center dark:border-gray-800">
          <p className="text-light fade-in-element text-sm">
            Agustio Joshua “Tio” Maitimu — Bali, Indonesia
          </p>
          <p
            className="fade-in-element mt-2 text-xs text-gray-400 dark:text-gray-600"
            style={{ ['--fade-delay']: '100ms' }}
          >
            Local Time: <span id="local-time"></span>
          </p>
        </div>
      </footer>

      {/* Pill Navigation & Theme Toggle */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center gap-x-3 p-4 sm:p-6">
        <nav
          id="pill-nav"
          className="flex items-center gap-x-1 rounded-full border border-white/10 bg-gray-900/80 px-3 py-2 shadow-lg backdrop-blur-md"
        >
          <a
            href="#about"
            className="nav-link rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            About
          </a>
          <a
            href="#projects"
            className="nav-link rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Projects
          </a>
          <a
            href="#contact"
            className="nav-link rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Contact
          </a>
        </nav>
        <button
          id="theme-toggle"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-gray-900/80 text-gray-300 shadow-lg backdrop-blur-md transition-colors duration-300 hover:text-white"
          aria-label="Toggle dark mode"
        >
          <svg
            id="theme-icon-sun"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            id="theme-icon-moon"
            className="hidden h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </>
  )
}
