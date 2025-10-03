'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [isDark, setIsDark] = useState(true)
  const [localTime, setLocalTime] = useState('')
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

  return (
    <div className={isDark ? 'theme-dark' : ''}>
      <div
        className={`min-h-screen overflow-x-hidden antialiased ${
          isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-slate-800'
        }`}
      >
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          {/* Header */}
          <header className="flex items-center justify-between py-8">
            <div>
              <a
                href="https://youtube.com"
                className={`font-syne text-2xl font-extrabold ${
                  isDark ? 'text-zinc-100' : ''
                }`}
              >
                Agustio M.
              </a>
            </div>
            <div className="flex items-center space-x-4 md:space-x-8">
              <nav>
                <ul className="flex space-x-6 md:space-x-8">
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
            <section id="about" className="reveal py-24 md:py-32">
              <div className="space-y-12">
                <p
                  className={`text-lg leading-relaxed font-medium md:text-xl ${
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
                  className={`space-y-8 border-l-2 pl-8 ${
                    isDark ? 'border-zinc-700' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <h3
                      className={`font-roboto-mono text-xl font-medium tracking-tight ${
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
                      className={`mt-2 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
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
                      className={`font-roboto-mono text-xl font-medium tracking-tight ${
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
                      className={`mt-2 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
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
                  <div className="mb-8 flex items-baseline justify-between">
                    <h3
                      className={`font-syne text-5xl font-extrabold md:text-7xl ${
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
                    <img
                      src="https://placehold.co/1000x750/27272A/E5E7EB?text=Keepsake"
                      alt="Keepsake project placeholder"
                      className="aspect-[4/3] w-full cursor-pointer rounded-xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                  <div className="max-w-2xl">
                    <p
                      className={`mb-6 text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
                      An iOS camera app that uses customizable Home Screen
                      widgets to organize photos into specific, per-widget
                      albums.
                    </p>
                    <ul
                      className={`list-inside list-disc space-y-2 ${
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
                  </div>
                </div>

                {/* Project 2: SwiSekai */}
                <div className="reveal">
                  <div className="mb-8 flex items-baseline justify-between">
                    <h3
                      className={`font-syne text-5xl font-extrabold md:text-7xl ${
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
                    <img
                      src="https://placehold.co/1000x750/27272A/E5E7EB?text=SwiSekai"
                      alt="SwiSekai project placeholder"
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
                      className={`inline-block list-inside list-disc space-y-2 text-left ${
                        isDark ? 'text-zinc-400' : 'text-slate-700'
                      }`}
                    >
                      <li>
                        Built the YAML-to-content pipeline for learning
                        materials.
                      </li>
                      <li>
                        Created a SwiftData model with Keychain-secured API key
                        storage.
                      </li>
                      <li>
                        Implemented core navigation and a responsive UI for
                        projects.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Project 3: Memmy */}
                <div className="reveal">
                  <div className="mb-8 flex items-baseline justify-between">
                    <h3
                      className={`font-syne text-5xl font-extrabold md:text-7xl ${
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
                    <img
                      src="https://placehold.co/1000x750/27272A/E5E7EB?text=Memmy"
                      alt="Memmy project placeholder"
                      className="aspect-[4/3] w-full cursor-pointer rounded-xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                  <div className="max-w-2xl">
                    <p
                      className={`mb-6 text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
                    >
                      A solo-developed iOS checklist app with a configurable
                      Home Screen widget for glanceable information and quick
                      access.
                    </p>
                    <ul
                      className={`list-inside list-disc space-y-2 ${
                        isDark ? 'text-zinc-400' : 'text-slate-700'
                      }`}
                    >
                      <li>
                        Developed the full app using SwiftData for persistence.
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
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 text-center md:py-48">
              <h2
                className={`reveal font-syne mb-8 text-5xl leading-tight font-extrabold tracking-tighter md:text-7xl ${
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
                  className={`reveal link-underline text-2xl font-medium md:text-3xl ${
                    isDark ? 'text-zinc-300' : ''
                  }`}
                  data-reveal-threshold="0.6"
                >
                  agustiomaitimu.apple@gmail.com
                </a>
                <a
                  href="https://youtube.com"
                  className={`reveal link-underline text-xl font-medium md:text-2xl ${
                    isDark ? 'text-zinc-400' : ''
                  }`}
                  data-reveal-threshold="0.7"
                  target="_blank"
                  rel="noopener noreferrer"
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
        </div>
      </div>
    </div>
  )
}
