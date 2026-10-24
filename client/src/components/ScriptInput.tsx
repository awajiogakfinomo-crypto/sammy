import { useState, useRef, useEffect } from 'react'
import { ScriptAnalysisResult } from '../types'

interface ScriptInputProps {
  onAnalyze: (script: string) => void
  loading: boolean
  analysis: ScriptAnalysisResult | null
}

export default function ScriptInput({ onAnalyze, loading, analysis }: ScriptInputProps) {
  const [script, setScript] = useState('')
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (script.trim() && !loading) {
      onAnalyze(script.trim())
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setScript(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Paste Your Script</h2>
        <p className="text-gray-600">
          Enter your script below and we'll find matching real stock footage for each scene.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={script}
            onChange={(e) => {
              const value = e.target.value
              setScript(value)
              setCharCount(value.length)
            }}
            placeholder="Paste your script here...&#10;&#10;Example:&#10;A man runs through a busy city street at night, neon lights reflecting on wet pavement. He turns a corner and sees a stray dog. He stops to pet it.&#10;&#10;The website will break this into scenes and find matching footage for each."
            className="w-full min-h-[300px] p-6 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed placeholder-gray-400"
            disabled={loading}
            rows={15}
          />
          <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
            {charCount} characters
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            type="submit"
            disabled={!script.trim() || loading}
            className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Script & Find Footage'
            )}
          </button>

          <label className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-700 font-medium">Upload .txt file</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis?.totalScenes || 0}</div>
            <div className="text-sm text-blue-700">Scenes Detected</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analysis?.scenes.reduce((acc, s) => acc + s.videos.length, 0) || 0}
            </div>
            <div className="text-sm text-green-700">Videos Found</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysis?.scenes.reduce((acc, s) => acc + s.images.length, 0) || 0}
            </div>
            <div className="text-sm text-purple-700">Images Found</div>
          </div>
        </div>
      </form>

      {analysis && analysis.totalScenes > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Script analyzed successfully! </span>
            <span className="text-gray-600">Switch to the Results tab to review and download footage.</span>
          </div>
        </div>
      )}
    </div>
  )
}