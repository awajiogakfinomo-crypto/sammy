export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Stock Footage Finder helps you find real stock footage that matches your script.
              Enter your script, and we'll search across multiple stock footage platforms to find
              matching videos and images for each scene.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Pexels</a> - Free stock photos & videos</li>
              <li><a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Pixabay</a> - Free images & videos</li>
              <li><a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Unsplash</a> - Free high-resolution photos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Note</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              All footage is sourced from real photographers and videographers.
              Please check individual licenses for usage rights before using in commercial projects.
              API keys are required for full functionality.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Stock Footage Finder - Find real footage for your scripts</p>
        </div>
      </div>
    </footer>
  )
}