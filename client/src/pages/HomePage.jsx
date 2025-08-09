import { Link } from 'react-router-dom'
// Slider removed for now

export default function HomePage() {
  return (
    <>
      <section className="hero min-h-[70vh] bg-gradient-to-br from-white via-white to-white text-neutral rounded-3xl overflow-hidden relative border">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{background: 'radial-gradient(circle at 20% 20%, #1d4ed8 0, transparent 40%), radial-gradient(circle at 80% 30%, #7c3aed 0, transparent 40%), radial-gradient(circle at 50% 80%, #16a34a 0, transparent 40%)'}}></div>
        <div className="hero-content text-center z-10">
          <div className="max-w-md lg:max-w-2xl">
            <h1 className="text-6xl lg:text-7xl font-black mb-6 text-neutral">
              StudyPathshala
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-neutral/80 font-medium">
              Master Your Tech Interviews
            </p>
            <p className="text-lg mb-8 text-neutral/70 max-w-xl mx-auto">
              Curated interview preparation books with interactive reading experience. 
              Practice coding, system design, and behavioral questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn btn-primary btn-lg shadow-md">
                📚 Browse Books
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                🚀 Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-10 right-10 opacity-10">
          <div className="text-9xl">💼</div>
        </div>
        <div className="absolute bottom-10 left-10 opacity-10">
          <div className="text-6xl">📖</div>
        </div>
      </section>
      
      <section className="mt-16 bg-white text-gray-900 rounded-2xl p-8 border shadow-xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose StudyPathshala?</h2>
          <p className="text-xl text-gray-700">Your comprehensive interview preparation platform</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="card-title justify-center text-2xl mb-3">Focused Content</h3>
              <p className="text-gray-600">Curated books specifically for tech interview preparation</p>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-pink-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="card-title justify-center text-2xl mb-3">Interactive Reading</h3>
              <p className="text-gray-600">Beautiful page-by-page reading with progress tracking</p>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="card-title justify-center text-2xl mb-3">Premium Access</h3>
              <p className="text-gray-600">Unlock advanced content with subscription</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slider removed */}
    </>
  )
}

