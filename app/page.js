/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

export default function Page() {
  const [isDark, setIsDark] = useState(true)
  const [localTime, setLocalTime] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerSrc, setViewerSrc] = useState('/swisekai.png')
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const pointersRef = useRef(new Map())
  const lastPinchRef = useRef(null)
  const isPanningRef = useRef(false)
  const lastPanRef = useRef({ x: 0, y: 0 })
  const lastTapRef = useRef(0)
  // IntersectionObserver for reveal animations
  useEffect(() => {
    const ios = []

    // Default reveals (no custom threshold)
    const defaultEls = document.querySelectorAll(
      '.reveal:not([data-reveal-threshold])',
    )
    const ioDefault = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 },
    )
    defaultEls.forEach((el) => ioDefault.observe(el))
    ios.push(ioDefault)

    // Custom threshold reveals
    const customEls = document.querySelectorAll(
      '.reveal[data-reveal-threshold]',
    )
    const observerByThreshold = new Map()
    customEls.forEach((el) => {
      const t = parseFloat(el.getAttribute('data-reveal-threshold') || '0.1')
      if (!observerByThreshold.has(t)) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add('visible')
            })
          },
          { threshold: t },
        )
        observerByThreshold.set(t, io)
        ios.push(io)
      }
      observerByThreshold.get(t).observe(el)
    })

    return () => {
      ios.forEach((io) => io.disconnect())
    }
  }, [])

  // Simple client init: read saved theme or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') {
        setIsDark(saved === 'dark')
        return
      }
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setIsDark(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // End reveal setup

  // Local time updater
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setLocalTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Makassar',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {}
      return next
    })
  }

  const openViewer = (src) => {
    setViewerSrc(src || '/swisekai.png')
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    setViewerOpen(true)
  }

  const closeViewer = () => setViewerOpen(false)

  useEffect(() => {
    // Keep the <html> background in sync with theme to avoid white edges
    try {
      const root = document.documentElement
      root.classList.toggle('theme-dark', isDark)
    } catch {}
  }, [isDark])

  useEffect(() => {
    if (!viewerOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setViewerOpen(false)
    }
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevTouchAction = body.style.touchAction
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      body.style.touchAction = prevTouchAction
    }
  }, [viewerOpen])

  // Helpers for zoom/pan bounds
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
  const clampTranslate = (nx, ny, s) => {
    const el = containerRef.current
    if (!el) return { x: nx, y: ny }
    const rect = el.getBoundingClientRect()
    const maxX = ((s - 1) * rect.width) / 2
    const maxY = ((s - 1) * rect.height) / 2
    return { x: clamp(nx, -maxX, maxX), y: clamp(ny, -maxY, maxY) }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    const next = clamp(scale + delta * 0.0015, 1, 4)
    if (next === scale) return
    setScale(next)
    // Slightly adjust translate toward cursor for nicer feel
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const factor = 0.1 * (next - scale)
      const { x, y } = clampTranslate(
        translate.x - cx * factor,
        translate.y - cy * factor,
        next,
      )
      setTranslate({ x, y })
    }
  }

  const onPointerDown = (e) => {
    const target = containerRef.current
    if (!target) return
    target.setPointerCapture?.(e.pointerId)
    // Double-tap detection for mobile
    const now = Date.now()
    if (pointersRef.current.size === 0 && now - lastTapRef.current < 300) {
      const next = scale > 1 ? 1 : 2.5
      setScale(next)
      setTranslate({ x: 0, y: 0 })
      isPanningRef.current = false
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const centerX = (pts[0].x + pts[1].x) / 2
      const centerY = (pts[0].y + pts[1].y) / 2
      lastPinchRef.current = {
        distance: Math.hypot(dx, dy),
        centerX,
        centerY,
        scale,
        translate,
      }
    } else if (scale > 1) {
      isPanningRef.current = true
      lastPanRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2 && lastPinchRef.current) {
      const pts = Array.from(pointersRef.current.values())
      const dx = pts[0].x - pts[1].x
      const dy = pts[0].y - pts[1].y
      const centerX = (pts[0].x + pts[1].x) / 2
      const centerY = (pts[0].y + pts[1].y) / 2
      const newDist = Math.hypot(dx, dy)
      const base = lastPinchRef.current
      let nextScale = clamp((newDist / base.distance) * base.scale, 1, 4)
      setScale(nextScale)
      const dxC = centerX - base.centerX
      const dyC = centerY - base.centerY
      const { x, y } = clampTranslate(
        base.translate.x + dxC,
        base.translate.y + dyC,
        nextScale,
      )
      setTranslate({ x, y })
    } else if (isPanningRef.current) {
      const dx = e.clientX - lastPanRef.current.x
      const dy = e.clientY - lastPanRef.current.y
      lastPanRef.current = { x: e.clientX, y: e.clientY }
      const { x, y } = clampTranslate(translate.x + dx, translate.y + dy, scale)
      setTranslate({ x, y })
    }
  }

  const onPointerUp = (e) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) {
      lastPinchRef.current = null
    }
    if (pointersRef.current.size === 0) {
      isPanningRef.current = false
    }
  }

  const onDouble = (e) => {
    e.preventDefault()
    const next = scale > 1 ? 1 : 2.5
    setScale(next)
    setTranslate({ x: 0, y: 0 })
  }

  return (
    <div className={isDark ? 'theme-dark' : ''}>
      <div
        className={`min-h-screen overflow-x-hidden antialiased ${
          isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-slate-800'
        }`}
      >
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-center gap-3 py-6 md:justify-between">
            <div className="w-full text-center md:w-auto md:text-left">
              <span
                className={`font-syne text-2xl font-extrabold ${
                  isDark ? 'text-zinc-100' : ''
                }`}
              >
                Agustio M.
              </span>
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-4 md:w-auto md:justify-end md:gap-8">
              <nav>
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:text-base md:gap-x-8">
                  <li>
                    <a
                      href="#about"
                      className={`link-underline font-medium ${
                        isDark ? 'text-zinc-400' : ''
                      }`}
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#projects"
                      className={`link-underline font-medium ${
                        isDark ? 'text-zinc-400' : ''
                      }`}
                    >
                      Projects
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className={`link-underline font-medium ${
                        isDark ? 'text-zinc-400' : ''
                      }`}
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
              <button
                id="theme-toggle"
                type="button"
                onClick={toggleTheme}
                className={`rounded-lg p-2.5 text-sm focus:outline-none ${
                  isDark
                    ? 'text-gray-400 hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-700'
                    : 'text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {/* Show sun icon in light mode, moon in dark mode */}
                {!isDark ? (
                  // Sun icon (outline)
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2m0 16v2M22 12h-2M4 12H2m15.364 6.364l-1.414-1.414M8.05 8.05L6.636 6.636m0 10.728l1.414-1.414M16.95 7.05l1.414-1.414" />
                  </svg>
                ) : (
                  // Moon icon (outline)
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </header>

          <main>
            {/* About Section */}
            <section id="about" className="reveal py-16 md:py-32">
              <div className="mx-auto max-w-2xl space-y-8 md:space-y-12">
                <p
                  className={`mx-auto max-w-[34ch] text-base leading-relaxed font-medium sm:max-w-[50ch] sm:text-lg md:text-xl ${
                    isDark ? 'text-zinc-300' : 'text-slate-800'
                  }`}
                >
                  I build apps for the Apple ecosystem with experience in
                  frontend and backend development, collaborative GitHub
                  workflows, and shipping multiple apps to the App Store. I have
                  worked in multicultural, cross-functional teams and applied
                  design thinking, accessibility, and a user-centered mindset to
                  deliver products in fast-paced, iterative cycles.
                </p>
                <div
                  className={`mx-auto max-w-[48ch] space-y-6 border-l pl-4 sm:max-w-[60ch] sm:pl-6 md:border-l-2 md:pl-8 ${
                    isDark ? 'border-zinc-700' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <h3
                      className={`font-roboto-mono text-lg font-medium tracking-tight sm:text-xl ${
                        isDark ? 'text-zinc-100' : 'text-black'
                      }`}
                    >
                      Apple Developer Academy @BINUS - Bali
                    </h3>
                    <p
                      className={`mt-1 font-mono text-sm ${
                        isDark ? 'text-zinc-500' : 'text-gray-500'
                      }`}
                    >
                      Mar – Dec 2025
                    </p>
                    <p
                      className={`mt-2 text-sm sm:text-base ${
                        isDark ? 'text-zinc-400' : 'text-gray-600'
                      }`}
                    >
                      Enrolled in a 10-month program learning Apple ecosystem
                      development, design thinking, and professional skills.
                      Delivered multiple App Store-published apps in
                      multicultural teams, contributing across frontend
                      (SwiftUI, widgets) and backend (persistence,
                      integrations), while maintaining GitHub repo health.
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`font-roboto-mono text-lg font-medium tracking-tight sm:text-xl ${
                        isDark ? 'text-zinc-100' : 'text-black'
                      }`}
                    >
                      Self-Directed Learning
                    </h3>
                    <p
                      className={`mt-1 font-mono text-sm ${
                        isDark ? 'text-zinc-500' : 'text-gray-500'
                      }`}
                    >
                      Sep 2023 – Oct 2024
                    </p>
                    <p
                      className={`mt-2 text-sm sm:text-base ${
                        isDark ? 'text-zinc-400' : 'text-gray-600'
                      }`}
                    >
                      Self-taught in frontend web development with React,
                      Next.js, Tailwind CSS, and GitHub workflows. Built and
                      deployed responsive apps on Vercel, including a dedicated
                      frontend development portfolio site.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-16">
              <div className="space-y-24 md:space-y-32">
                {/* Project 1: Keepsake */}
                <div className="reveal">
                  <div className="mb-8 flex items-baseline justify-center md:justify-between">
                    <h3
                      className={`font-syne text-center text-4xl leading-tight font-extrabold sm:text-5xl md:text-left md:text-7xl ${
                        isDark ? 'text-zinc-100' : ''
                      }`}
                    >
                      Keepsake
                    </h3>
                    <span
                      className={`hidden font-mono md:block ${
                        isDark ? 'text-zinc-500' : 'text-gray-400'
                      }`}
                    >
                      / 01
                    </span>
                  </div>
                  <div className="mb-8">
                    <Image
                      src="/keepsake.png"
                      alt="Keepsake project image"
                      width={1000}
                      height={750}
                      onClick={() => openViewer('/keepsake.png')}
                      className="aspect-[4/3] w-full cursor-pointer rounded-xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                    <div className="mt-8 max-w-2xl">
                      <p
                        className={`mb-6 text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        An iOS camera app that uses customizable Home Screen
                        widgets to organize photos into specific, per-widget
                        albums.
                      </p>
                      <ul
                        className={`list-disc space-y-2 pl-5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-700'
                        }`}
                      >
                        <li>
                          Built a customizable Home Screen widget with deep
                          linking.
                        </li>
                        <li>
                          Utilized AppIntents &amp; App Groups for robust data
                          sharing.
                        </li>
                        <li>
                          Implemented advanced camera features like multi-lens
                          zoom &amp; tap-to-focus.
                        </li>
                      </ul>
                      <div className="mt-6 flex gap-3">
                        <a
                          href="https://apps.apple.com/id/app/keepsake-quick-album-camera/id6746714682"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View Keepsake"
                          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                            isDark
                              ? 'bg-white text-black hover:bg-zinc-200 focus:ring-white/60'
                              : 'bg-black text-white hover:bg-neutral-900 focus:ring-black/50'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            className="h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              fill="currentColor"
                              d="M318.7 268.7c-.3-37.7 16.4-66.2 49.9-87.1-18.8-27.3-47.3-42.3-85.2-45.3-35.7-2.8-74.6 20.9-88.9 20.9-15 0-49.6-20.1-76.7-20.1C64.9 138.1 8 184.6 8 273.7c0 27.1 4.9 55 14.8 83.7 13.2 37.7 60.6 130 109.7 128.4 25.7-.6 44-18.3 77.6-18.3 32.8 0 49.6 18.3 76.7 18.3 49.5-.7 92.8-85.7 105.6-123.5-67.9-32.1-73.7-94-73.7-93.6zM255.3 81.9c27.1-32.4 24.6-61.9 23.7-72-23 1.3-49.7 15.5-64.9 33.6-17.8 20.6-28.2 45.8-26 72.7 24.9 1.9 48.7-11 67.2-34.3z"
                            />
                          </svg>
                          <span>View On Appstore</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project 2: SwiSekai */}
                <div className="reveal">
                  <div className="mb-8 flex items-baseline justify-center md:justify-between">
                    <h3
                      className={`font-syne text-center text-4xl leading-tight font-extrabold sm:text-5xl md:text-left md:text-7xl ${
                        isDark ? 'text-zinc-100' : ''
                      }`}
                    >
                      SwiSekai
                    </h3>
                    <span
                      className={`hidden font-mono md:block ${
                        isDark ? 'text-zinc-500' : 'text-gray-400'
                      }`}
                    >
                      / 02
                    </span>
                  </div>
                  <div className="mb-8">
                    <Image
                      src="/swisekai.png"
                      alt="SwiSekai project image"
                      width={1000}
                      height={750}
                      onClick={() => openViewer('/swisekai.png')}
                      className="aspect-[4/3] w-full cursor-pointer rounded-xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                  <div className="ml-auto max-w-2xl text-right">
                    <p
                      className={`mb-6 text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
                      A macOS learning platform that teaches Swift.
                    </p>
                    <ul
                      className={`inline-block list-disc space-y-2 pl-5 text-left ${
                        isDark ? 'text-zinc-400' : 'text-slate-700'
                      }`}
                    >
                      <li>
                        Built the YAML-to-content pipeline for learning
                        materials.
                      </li>
                      <li>Built a SwiftData model to persist user progress.</li>
                      <li>Secured AI companion API keys using Keychain.</li>
                      <li>
                        Implemented core navigation and a responsive UI for
                        projects.
                      </li>
                    </ul>
                    <div className="mt-6 flex justify-end gap-3">
                      <a
                        href="https://apps.apple.com/id/app/swisekai/id6751531464?mt=12%20SwiSekai"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View SwiSekai"
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                          isDark
                            ? 'bg-white text-black hover:bg-zinc-200 focus:ring-white/60'
                            : 'bg-black text-white hover:bg-neutral-900 focus:ring-black/50'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                          className="h-4 w-4"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            fill="currentColor"
                            d="M318.7 268.7c-.3-37.7 16.4-66.2 49.9-87.1-18.8-27.3-47.3-42.3-85.2-45.3-35.7-2.8-74.6 20.9-88.9 20.9-15 0-49.6-20.1-76.7-20.1C64.9 138.1 8 184.6 8 273.7c0 27.1 4.9 55 14.8 83.7 13.2 37.7 60.6 130 109.7 128.4 25.7-.6 44-18.3 77.6-18.3 32.8 0 49.6 18.3 76.7 18.3 49.5-.7 92.8-85.7 105.6-123.5-67.9-32.1-73.7-94-73.7-93.6zM255.3 81.9c27.1-32.4 24.6-61.9 23.7-72-23 1.3-49.7 15.5-64.9 33.6-17.8 20.6-28.2 45.8-26 72.7 24.9 1.9 48.7-11 67.2-34.3z"
                          />
                        </svg>
                        <span>View On Appstore</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project 3: Memmy */}
                <div className="reveal">
                  <div className="mb-8 flex items-baseline justify-center md:justify-between">
                    <h3
                      className={`font-syne text-center text-4xl leading-tight font-extrabold sm:text-5xl md:text-left md:text-7xl ${
                        isDark ? 'text-zinc-100' : ''
                      }`}
                    >
                      Memmy
                    </h3>
                    <span
                      className={`hidden font-mono md:block ${
                        isDark ? 'text-zinc-500' : 'text-gray-400'
                      }`}
                    >
                      / 03
                    </span>
                  </div>
                  <div className="mb-8">
                    <Image
                      src="/memmy.png"
                      alt="Memmy project image"
                      width={1000}
                      height={750}
                      onClick={() => openViewer('/memmy.png')}
                      className="aspect-[4/3] w-full cursor-pointer rounded-xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                    <div className="mt-8 max-w-2xl">
                      <p
                        className={`mb-6 text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
                      >
                        A solo-developed iOS checklist app with a configurable
                        Home Screen widget for glanceable information and quick
                        access.
                      </p>
                      <ul
                        className={`list-disc space-y-2 pl-5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-700'
                        }`}
                      >
                        <li>
                          Developed the full app using SwiftData for
                          persistence.
                        </li>
                        <li>
                          Implemented search/sort, batch delete, and daily reset
                          features.
                        </li>
                        <li>
                          Created a configurable Home Screen widget for deep
                          linking.
                        </li>
                      </ul>
                      <div className="mt-6 flex gap-3">
                        <a
                          href="https://apps.apple.com/id/app/memmy-smart-checklists/id6745719250"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View Memmy"
                          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                            isDark
                              ? 'bg-white text-black hover:bg-zinc-200 focus:ring-white/60'
                              : 'bg-black text-white hover:bg-neutral-900 focus:ring-black/50'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            className="h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              fill="currentColor"
                              d="M318.7 268.7c-.3-37.7 16.4-66.2 49.9-87.1-18.8-27.3-47.3-42.3-85.2-45.3-35.7-2.8-74.6 20.9-88.9 20.9-15 0-49.6-20.1-76.7-20.1C64.9 138.1 8 184.6 8 273.7c0 27.1 4.9 55 14.8 83.7 13.2 37.7 60.6 130 109.7 128.4 25.7-.6 44-18.3 77.6-18.3 32.8 0 49.6 18.3 76.7 18.3 49.5-.7 92.8-85.7 105.6-123.5-67.9-32.1-73.7-94-73.7-93.6zM255.3 81.9c27.1-32.4 24.6-61.9 23.7-72-23 1.3-49.7 15.5-64.9 33.6-17.8 20.6-28.2 45.8-26 72.7 24.9 1.9 48.7-11 67.2-34.3z"
                            />
                          </svg>
                          <span>View On Appstore</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 text-center md:py-48">
              <h2
                className={`reveal font-syne mb-8 text-4xl leading-tight font-extrabold tracking-tighter sm:text-5xl md:text-7xl ${
                  isDark ? 'text-zinc-100' : ''
                }`}
                data-reveal-threshold="0.5"
              >
                {`Let's build`}
                <br />
                something great.
              </h2>
              <div className="flex flex-col items-center justify-center gap-6">
                <a
                  href="mailto:agustiomaitimu.apple@gmail.com"
                  className={`reveal link-underline text-xl font-medium sm:text-2xl md:text-3xl ${
                    isDark ? 'text-zinc-300' : ''
                  }`}
                  data-reveal-threshold="0.6"
                >
                  agustiomaitimu.apple@gmail.com
                </a>
                <a
                  href="/resume.docx"
                  download
                  className={`reveal link-underline text-lg font-medium sm:text-xl md:text-2xl ${
                    isDark ? 'text-zinc-400' : ''
                  }`}
                  data-reveal-threshold="0.7"
                >
                  Download Résumé
                </a>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center">
              <div className="flex justify-center space-x-6">
                <a
                  href="https://github.com/AgustioMaitimu"
                  className={`reveal link-underline ${
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/agustio-maitimu/"
                  className={`reveal link-underline ${
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  }`}
                  data-reveal-threshold="0.2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
              <p
                className={`reveal mt-8 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}
              >
                Agustio Joshua Maitimu — Bali, Indonesia
              </p>
              <p
                className={`reveal mt-2 text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}
              >
                Local Time (Central Indonesia Time):{' '}
                <span id="local-time">{localTime}</span>
              </p>
            </footer>
          </main>
          {viewerOpen && typeof window !== 'undefined'
            ? createPortal(
                <div
                  className="fixed inset-0 z-[100] flex h-full w-full items-center justify-center bg-black/90 backdrop-blur-sm"
                  onClick={closeViewer}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Image viewer"
                >
                  <div
                    ref={containerRef}
                    className="relative flex h-full w-full touch-none items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={handleWheel}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onDoubleClick={onDouble}
                  >
                    <button
                      onClick={closeViewer}
                      aria-label="Close image viewer"
                      className="absolute top-4 right-4 z-[101] rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                    <Image
                      ref={imgRef}
                      src={viewerSrc}
                      alt="Image preview"
                      width={1600}
                      height={1200}
                      draggable={false}
                      className={`${
                        scale > 1
                          ? isPanningRef.current
                            ? 'cursor-grabbing'
                            : 'cursor-grab'
                          : 'cursor-zoom-in'
                      } max-h-[90vh] max-w-[95vw] rounded-lg object-contain select-none`}
                      style={{
                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                        transition:
                          isPanningRef.current || pointersRef.current.size === 2
                            ? 'none'
                            : 'transform 0.15s ease-out',
                        touchAction: 'none',
                      }}
                      priority
                    />
                  </div>
                </div>,
                document.body,
              )
            : null}
        </div>
      </div>
    </div>
  )
}
