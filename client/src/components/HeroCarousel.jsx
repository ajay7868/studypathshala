import { elearningImages } from '../data/images.js'

export default function HeroCarousel() {
  return (
    <div className="carousel w-full max-w-4xl mx-auto rounded-2xl shadow-lg">
      {elearningImages.slice(0,5).map((src, i) => (
        <div id={`slide-${i}`} key={i} className="carousel-item relative w-full h-72">
          <img src={src} alt="e-learning" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/60 to-transparent" />
          <div className="absolute left-4 right-4 bottom-4 flex justify-between">
            <a href={`#slide-${(i+4)%5}`} className="btn btn-sm">❮</a>
            <a href={`#slide-${(i+1)%5}`} className="btn btn-sm">❯</a>
          </div>
        </div>
      ))}
    </div>
  )
}

