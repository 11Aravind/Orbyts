'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export function Button({ variant = 'primary', size = 'md', href, onClick, children, className = '', type = 'button' }: ButtonProps) {
  const cls = `btn btn-${variant} btn-${size} ${className}`.trim()
  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a className={cls} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  )
}

interface HeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  id?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', id }: HeadingProps) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id}>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

export function Section({
  id,
  tone = 'white',
  labelledBy,
  children,
}: {
  id: string
  tone?: 'white' | 'alt' | 'blue'
  labelledBy?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`section tone-${tone}`} aria-labelledby={labelledBy}>
      <div className="container max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}

/** Fades content in as it scrolls into view. Always becomes visible after a short fallback. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`.trim()} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
