'use client'

import { useEffect } from 'react'

export default function KeepsakeProject() {
  useEffect(() => {
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

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, observerOptions)
    document
      .querySelectorAll('.fade-in-element')
      .forEach((el) => observer.observe(el))

    return () => {
      clearInterval(timeInterval)
      themeToggleBtn?.removeEventListener('click', onThemeClick)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <main className="mx-auto max-w-5xl p-6 pt-20 md:px-8 md:pt-24">
        <section className="fade-in-element text-left">
          <h1 className="text-strong text-4xl leading-none font-extrabold tracking-tighter md:text-5xl">
            Keepsake
          </h1>
          <p className="text-light mt-3 text-lg md:text-xl">
            iOS widget-based camera app
          </p>
          <div className="bg-card mx-auto mt-8 max-w-3xl overflow-hidden rounded-lg shadow-lg">
            <div className="aspect-3-2 w-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </section>

        <div className="mt-24 space-y-24 md:mt-32 md:space-y-32">
          <section id="overview">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container fade-in-element">
                  <h2 className="reveal-text text-strong text-2xl font-bold tracking-tight">
                    Overview
                  </h2>
                </div>
              </div>
              <div className="fade-in-element space-y-8 md:col-span-2">
                <p className="text-main text-lg leading-relaxed">
                  Keepsake is an iOS camera app built around customizable Home
                  Screen widgets. It allows users to create specific, per-widget
                  photo albums, providing glanceable access to memories and a
                  deep-link into a camera interface with advanced controls.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <h3 className="text-strong font-semibold">Role</h3>
                    <p className="text-light mt-1">iOS Developer</p>
                  </div>
                  <div>
                    <h3 className="text-strong font-semibold">Timeline</h3>
                    <p className="text-light mt-1">May – Jun 2025</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-strong font-semibold">Tech Stack</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      SwiftUI
                    </span>
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      SwiftData
                    </span>
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      WidgetKit
                    </span>
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      AppIntents
                    </span>
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      TipKit
                    </span>
                    <span className="text-light rounded-full bg-gray-200/50 px-3 py-1 text-sm font-medium dark:bg-gray-700/50">
                      StoreKit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="rule" />

          <section id="features">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container fade-in-element">
                  <h2 className="reveal-text text-strong text-2xl font-bold tracking-tight">
                    My Contributions
                  </h2>
                </div>
              </div>
              <div className="space-y-20 md:col-span-2">
                <div className="fade-in-element">
                  <h3 className="text-strong text-xl font-bold">
                    Widget-First Experience
                  </h3>
                  <p className="text-main mt-3 text-lg leading-relaxed">
                    Used WidgetKit, AppIntents, and App Groups to engineer the
                    core widget experience. This enabled per-widget photo albums
                    and deep-linking from the Home Screen directly into the
                    in-app camera.
                  </p>
                  <div className="bg-card mt-8 overflow-hidden rounded-lg shadow-lg">
                    <div className="aspect-3-2 w-full bg-gray-300 dark:bg-gray-700" />
                  </div>
                </div>
                <div className="fade-in-element">
                  <h3 className="text-strong text-xl font-bold">
                    Refined User Onboarding &amp; Feedback
                  </h3>
                  <p className="text-main mt-3 text-lg leading-relaxed">
                    Enhanced the user journey by integrating modern iOS
                    frameworks, creating non-intrusive onboarding tips with
                    TipKit, and implementing contextual App Store review prompts
                    with StoreKit to boost user feedback.
                  </p>
                  <div className="bg-card mt-8 overflow-hidden rounded-lg shadow-lg">
                    <div className="aspect-3-2 w-full bg-gray-300 dark:bg-gray-700" />
                  </div>
                </div>
                <div className="fade-in-element">
                  <h3 className="text-strong text-xl font-bold">
                    Advanced Camera Controls
                  </h3>
                  <p className="text-main mt-3 text-lg leading-relaxed">
                    Implemented advanced camera features, including seamless
                    lens transitions with haptic feedback, tap-to-focus, and
                    manual exposure sliders. Also corrected front-camera
                    mirroring to ensure photo output matches the preview.
                  </p>
                  <div className="bg-card mt-8 overflow-hidden rounded-lg shadow-lg">
                    <div className="aspect-3-2 w-full bg-gray-300 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto mt-24 max-w-5xl p-6 pb-16 md:mt-32 md:px-8">
        <div className="border-t border-gray-200 pt-8 text-center dark:border-gray-800">
          <p className="text-light fade-in-element text-sm">
            Agustio Joshua “Tio” Maitimu — Bali, Indonesia
          </p>
          <p
            className="fade-in-element mt-2 text-xs text-gray-400 dark:text-gray-600"
            style={{ transitionDelay: '100ms' }}
          >
            Local Time: <span id="local-time"></span>
          </p>
        </div>
      </footer>

      <div className="fixed right-0 bottom-0 z-50 p-4 sm:p-6">
        <button
          id="theme-toggle"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gray-900/80 text-gray-300 shadow-lg backdrop-blur-md transition-colors duration-300 hover:text-white"
          aria-label="Toggle dark mode"
        >
          <svg
            id="theme-icon-sun"
            className="h-6 w-6"
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
            className="hidden h-6 w-6"
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
