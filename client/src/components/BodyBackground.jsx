import { useEffect, useState } from 'react'
import { elearningImages } from '../data/images.js'

export default function BodyBackground() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % elearningImages.length)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const current = elearningImages[idx]
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-20 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${current})` }}
    />
  )
}

