import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  {
    eyebrow: 'New Arrivals',
    title: 'Radiant Skin, Effortless Beauty',
    subtitle: 'Premium skin care crafted for the modern woman.',
    cta: 'Shop Skin Care',
    ctaLink: '/category/skincare',
    bg: 'linear-gradient(135deg, #fce8ef 0%, #fdf6e3 100%)',
    accent: '#d4698a',
    icon: 'bi-droplet-fill',
    emoji: '🌸',
  },
  {
    eyebrow: 'Bestseller',
    title: 'Luscious Hair, Crown of Glory',
    subtitle: '100% virgin human hair for every style.',
    cta: 'Shop Hair',
    ctaLink: '/category/hair',
    bg: 'linear-gradient(135deg, #f5ede6 0%, #fce8ef 100%)',
    accent: '#b0476a',
    icon: 'bi-scissors',
    emoji: '✨',
  },
  {
    eyebrow: 'Trending Now',
    title: 'Earrings that Steal the Show',
    subtitle: 'From studs to chandeliers — find your perfect pair.',
    cta: 'Shop Earrings',
    ctaLink: '/category/earrings',
    bg: 'linear-gradient(135deg, #fdf6e3 0%, #fce8ef 100%)',
    accent: '#c9a84c',
    icon: 'bi-gem',
    emoji: '💎',
  },
  {
    eyebrow: 'Flash Sale',
    title: 'Gorgeous Handbags, Every Occasion',
    subtitle: 'From brunch to night-out — carry your style with grace.',
    cta: 'Shop Handbags',
    ctaLink: '/category/handbags',
    bg: 'linear-gradient(135deg, #f0e8ec 0%, #fdf6e3 100%)',
    accent: '#d4698a',
    icon: 'bi-handbag-fill',
    emoji: '👜',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className="hero">
      <div
        className="hero__slide"
        style={{ background: slide.bg, transition: 'background 0.6s ease' }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', right: '5%', top: '10%',
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'rgba(212,105,138,0.08)',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute', right: '15%', bottom: '-10%',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(201,168,76,0.1)',
          zIndex: 1
        }}></div>

        <div className="hero__content">
          <div className="hero__eyebrow">
            <i className={`bi ${slide.icon}`}></i> {slide.eyebrow}
          </div>
          <h1 className="hero__title" style={{ transition: 'all 0.4s ease' }}>
            {slide.title.split(' ').map((word, i) => (
              i === 1 ? <em key={i} style={{ color: slide.accent }}> {word}</em> : ` ${word}`
            ))}
          </h1>
          <p className="hero__subtitle">{slide.subtitle}</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Link to={slide.ctaLink} className="btn btn-primary">
              {slide.emoji} {slide.cta}
            </Link>
            <Link to="/products" className="btn btn-outline">
              View All
            </Link>
          </div>
        </div>

        {/* Big emoji illustration */}
        <div style={{
          position: 'absolute',
          right: '10%',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10rem',
          zIndex: 2,
          opacity: 0.5,
          animation: 'float 3s ease-in-out infinite',
          userSelect: 'none'
        }}>
          {slide.emoji}
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(-50%) translateY(0); }
            50% { transform: translateY(-50%) translateY(-16px); }
          }
        `}</style>
      </div>

      {/* Dots */}
      <div className="hero__dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero__dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          ></button>
        ))}
      </div>
    </div>
  )
}