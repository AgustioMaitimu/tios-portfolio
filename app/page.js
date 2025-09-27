'use client'

import { useEffect } from 'react'
import LiquidGlass from 'liquid-glass-react'

export default function Home() {
  useEffect(() => {
    // --- TIME UPDATE LOGIC ---
    function updateTime() {
      const timeElement = document.getElementById('local-time')
      if (timeElement) {
        const now = new Date()
        const options = {
          timeZone: 'Asia/Makassar',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }
        timeElement.textContent =
          now.toLocaleTimeString('en-US', options) + ' (Central Indonesia Time)'
      }
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // --- FADE-IN ON SCROLL LOGIC ---
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove('is-visible')
        }
      })
    }, observerOptions)

    const elementsToFade = document.querySelectorAll('.fade-in-element')
    elementsToFade.forEach((el) => fadeInObserver.observe(el))

    // --- PILL NAV VISIBILITY LOGIC ---
    const navElement = document.getElementById('pill-nav')
    const triggerElement = document.getElementById('intro-trigger')

    let navObserver = null
    if (navElement && triggerElement) {
      navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              navElement.classList.add('is-visible')
            } else {
              navElement.classList.remove('is-visible')
            }
          })
        },
        { threshold: 0 },
      )
      navObserver.observe(triggerElement)
    }

    // --- HEADLINE COLOR SCROLL LOGIC (PROGRESS-BASED) ---
    const headline = document.getElementById('headline')
    const triggerDistance = 150

    const handleScrollAnimation = () => {
      const scrollY = window.scrollY
      const progress = Math.min(scrollY / triggerDistance, 1)
      if (headline)
        headline.style.setProperty('--reveal-progress', String(progress))
    }

    const onScroll = () => {
      window.requestAnimationFrame(handleScrollAnimation)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    handleScrollAnimation()

    // --- ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('section[id]')
    const navLinks = document.querySelectorAll('#pill-nav a')

    let sectionObserver = null
    if (sections.length > 0 && navLinks.length > 0) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          let currentSectionId = ''
          entries.forEach((entry) => {
            if (entry.isIntersecting) currentSectionId = entry.target.id
          })

          navLinks.forEach((link) => {
            link.classList.remove('active-nav-link')
            if (link.getAttribute('href') === `#${currentSectionId}`) {
              link.classList.add('active-nav-link')
            }
          })
        },
        { rootMargin: '-20% 0px -20% 0px', threshold: 0 },
      )
      sections.forEach(
        (section) => sectionObserver && sectionObserver.observe(section),
      )
    }

    return () => {
      clearInterval(timeInterval)
      fadeInObserver.disconnect()
      navObserver?.disconnect()
      sectionObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <main className="mx-auto max-w-5xl p-6 md:px-8 md:py-16">
        <div className="space-y-24 md:space-y-32">
          {/* Introduction Section */}
          <section className="fade-in-element pt-10 text-left md:pt-16">
            <h1
              id="intro-trigger"
              className="text-base font-semibold tracking-widest text-red-600 uppercase"
            >
              Agustio Joshua Maitimu
            </h1>
            <p
              id="headline"
              className="relative mt-4 text-5xl leading-none font-extrabold tracking-tighter md:text-7xl"
            >
              <span className="headline-base">
                Swift Developer <br />
                <span className="text-gray-400">
                  Building for Apple Platforms.
                </span>
              </span>
              <span className="headline-overlay absolute inset-0">
                <span className="text-gray-400">
                  Swift Developer <br />
                  <span className="text-black">
                    Building for Apple Platforms.
                  </span>
                </span>
              </span>
            </p>
            <p className="mt-6 max-w-2xl text-lg text-gray-600">
              Based in Bali, Indonesia. Currently honing my craft at the Apple
              Developer Academy.
            </p>
          </section>

          {/* About & Experience Section */}
          <section id="about" className="scroll-mt-20">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container fade-in-element">
                  <h2 className="reveal-text text-2xl font-bold tracking-tight">
                    About Me
                  </h2>
                </div>
              </div>
              <div className="fade-in-element space-y-8 sm:space-y-12 md:col-span-2">
                <p className="text-lg leading-relaxed text-gray-800">
                  I build multi-platform apps for iOS, macOS, and watchOS. My
                  focus is on creating clean SwiftUI interfaces, ensuring robust
                  data persistence, and shipping products that are a pleasure to
                  use. I thrive in collaborative teams, value thoughtful UI/UX,
                  and prioritize accessibility in every project.
                </p>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Apple Developer Academy @BINUS
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Immersed in a 10-month program covering the Apple ecosystem.
                    In multicultural teams, I’ve shipped multiple apps from
                    concept to launch, handling everything from SwiftUI
                    interfaces and data persistence to backend integrations and
                    maintaining repo health. (Mar–Dec 2025)
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Self-Directed Learning
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Self-taught in frontend web development, focusing on React,
                    Next.js, and Tailwind CSS to build personal projects and
                    component libraries. (2023–2024)
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="rule" />

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-20">
            <div className="grid items-start gap-8 md:grid-cols-3 md:gap-16">
              <div className="self-start md:sticky md:top-24 md:col-span-1">
                <div className="reveal-container fade-in-element">
                  <h2 className="reveal-text text-2xl font-bold tracking-tight">
                    Selected Work
                  </h2>
                </div>
              </div>
              <div className="space-y-10 md:col-span-2">
                {/* Project 1 */}
                <a
                  href="/projects/keepsake"
                  className="group project-card fade-in-element block"
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 w-full bg-gray-200 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                      Keepsake
                      <span className="project-arrow ml-2 text-gray-400 transition-all duration-300 ease-in-out">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      May–Jun 2025 · iOS, SwiftData, AppIntents
                    </p>
                    <p className="mt-2 text-gray-700">
                      An iOS camera app centered around Home Screen widgets.
                      Features per-widget albums, deep linking, and advanced
                      camera controls.
                    </p>
                  </div>
                </a>

                {/* Project 2 */}
                <a
                  href="/projects/swisekai"
                  className="group project-card fade-in-element block"
                  style={{ transitionDelay: '100ms' }}
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 w-full bg-gray-200 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                      SwiSekai
                      <span className="project-arrow ml-2 text-gray-400 transition-all duration-300 ease-in-out">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Jul–Aug 2025 · macOS, SwiftData, Keychain
                    </p>
                    <p className="mt-2 text-gray-700">
                      A macOS platform for learning Swift. Built with a
                      YAML-to-content pipeline, SwiftData for user profiles, and
                      a responsive UI.
                    </p>
                  </div>
                </a>

                {/* Project 3 */}
                <a
                  href="/projects/memmy"
                  className="group project-card fade-in-element block"
                  style={{ transitionDelay: '200ms' }}
                >
                  <div className="mx-auto mb-4 max-w-md overflow-hidden rounded-lg shadow-sm">
                    <div className="project-image aspect-3-2 w-full bg-gray-200 transition-transform duration-300 ease-in-out" />
                  </div>
                  <div className="mx-auto mt-3 max-w-md">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                      Memmy
                      <span className="project-arrow ml-2 text-gray-400 transition-all duration-300 ease-in-out">
                        &rarr;
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Apr–May 2025 · iOS, SwiftData, Widgets
                    </p>
                    <p className="mt-2 text-gray-700">
                      A full-featured iOS checklist app using SwiftData.
                      Includes search, sorting, daily resets, and a Home Screen
                      widget for quick access.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </section>

          <div className="rule" />

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20 pt-16 text-center">
            <h2 className="fade-in-element text-3xl font-bold tracking-tighter md:text-4xl">
              Let&apos;s Connect
            </h2>
            <p
              className="fade-in-element mx-auto mt-4 max-w-xl text-lg text-gray-600"
              style={{ transitionDelay: '100ms' }}
            >
              Have a project in mind or just want to say hello? I&apos;d love to
              hear from you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-base font-medium">
              <a
                href="mailto:agustiomaitimu.apple@gmail.com"
                className="group fade-in-element text-gray-700 transition-all duration-200 ease-in-out hover:text-red-600"
                style={{ transitionDelay: '200ms' }}
              >
                <span className="bg-gradient-to-r from-red-600 to-red-600 bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-all duration-300 ease-out group-hover:bg-[length:100%_1px]">
                  agustiomaitimu.apple@gmail.com
                </span>
              </a>
              <span
                className="fade-in-element hidden text-gray-300 sm:block"
                style={{ transitionDelay: '300ms' }}
              >
                ·
              </span>
              <a
                href="/resume.pdf"
                className="group fade-in-element text-gray-700 transition-all duration-200 ease-in-out hover:text-red-600"
                style={{ transitionDelay: '400ms' }}
                download
              >
                <span className="bg-gradient-to-r from-red-600 to-red-600 bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-all duration-300 ease-out group-hover:bg-[length:100%_1px]">
                  Download Résumé
                </span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-24 max-w-5xl p-6 pb-32 md:mt-32 md:px-8">
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="fade-in-element text-sm text-gray-500">
            Agustio Joshua “Tio” Maitimu — Bali, Indonesia
          </p>
          <p
            className="fade-in-element mt-1 text-xs text-gray-400"
            style={{ transitionDelay: '100ms' }}
          >
            Local Time: <span id="local-time"></span>
          </p>
        </div>
      </footer>

      {/* Pill Navigation */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex justify-center p-4 sm:p-6">
        <nav id="pill-nav" className="pointer-events-auto">
          <LiquidGlass
            displacementScale={64}
            blurAmount={0.1}
            saturation={130}
            aberrationIntensity={2}
            elasticity={0.3}
            cornerRadius={999}
            padding="8px 12px"
            className="flex items-center gap-x-1"
          >
            <a
              href="#about"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
            >
              About
            </a>
            <a
              href="#projects"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
            >
              Projects
            </a>
            <a
              href="#contact"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
            >
              Contact
            </a>
          </LiquidGlass>
        </nav>
      </div>
    </>
  )
}
