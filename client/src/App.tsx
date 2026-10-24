import { useState } from 'react'
import ScriptInput from './components/ScriptInput'
import SceneBreakdown from './components/SceneBreakdown'
import Footer from './components/Footer'
import { ScriptAnalysisResult } from './types'

function App() {
  const [analysis, setAnalysis] = useState<ScriptAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'scenes' | 'results'>('scenes')

  const handleAnalyze = async (script: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      })
      const data = await res.json()
      if (res.ok) {
        setAnalysis(data)
        setActiveTab('scenes')
      } else {
        alert(data.error || 'Failed to analyze script')
      }
    } catch (error) {
      alert('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchAll = async () => {
    if (!analysis) return
    setLoading(true)
    try {
      // Send the scenes array with the request (serverless has no persistent state)
      const res = await fetch('/api/search-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: analysis.scenes }),
      })
      const data = await res.json()
      if (res.ok) {
        // Update analysis with search results
        setAnalysis({ ...analysis, scenes: data.scenes })
      } else {
        alert(data.error || 'Failed to search footage')
      }
    } catch (error) {
      alert('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAnalysis = (updatedAnalysis: ScriptAnalysisResult) => {
    setAnalysis(updatedAnalysis)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h1 className="text-xl font-bold text-gray-900">Stock Footage Finder</h1>
            </div>
            <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'scenes'}
                onClick={() => setActiveTab('scenes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'scenes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Scenes
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'results'}
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'results'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Results
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scenes' ? (
          <ScriptInput onAnalyze={handleAnalyze} loading={loading} analysis={analysis} />
        ) : (
          analysis ? (
            <SceneBreakdown
              analysis={analysis}
              onUpdate={handleUpdateAnalysis}
              onSearchAll={handleSearchAll}
              loading={loading}
            />
          ) : (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-gray-900">No script analyzed yet</h2>
              <p className="mt-2 text-gray-500">Go to the Scenes tab and paste your script to get started</p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App