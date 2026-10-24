import { useState } from 'react'
import { ScriptAnalysisResult, Scene, StockVideo, StockImage } from '../types'
import VideoCard from './VideoCard'
import ImageCard from './ImageCard'

interface SceneBreakdownProps {
  analysis: ScriptAnalysisResult
  onUpdate: (analysis: ScriptAnalysisResult) => void
  onSearchAll: () => void
  loading: boolean
}

export default function SceneBreakdown({ analysis, onUpdate, onSearchAll, loading }: SceneBreakdownProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set())
  const [searchingScene, setSearchingScene] = useState<string | null>(null)

  const toggleScene = (sceneId: string) => {
    const newExpanded = new Set(expandedScenes)
    if (newExpanded.has(sceneId)) {
      newExpanded.delete(sceneId)
    } else {
      newExpanded.add(sceneId)
    }
    setExpandedScenes(newExpanded)
  }

  const handleSearchScene = async (scene: Scene) => {
    setSearchingScene(scene.id)
    try {
      // Send scenes array with request (serverless has no persistent state)
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: scene.id, queries: scene.searchQueries, scenes: analysis.scenes }),
      })
      const data = await res.json()
      if (res.ok) {
        const updatedScenes = analysis.scenes.map(s => s.id === scene.id ? data.scene : s)
        onUpdate({ ...analysis, scenes: updatedScenes })
      }
    } catch (error) {
      alert('Failed to search footage for this scene')
    } finally {
      setSearchingScene(null)
    }
  }

  const handleSelectionChange = (sceneId: string, videoIds: string[], imageIds: string[]) => {
    const updatedScenes = analysis.scenes.map(s =>
      s.id === sceneId ? { ...s, selectedVideoIds: videoIds, selectedImageIds: imageIds } : s
    )
    onUpdate({ ...analysis, scenes: updatedScenes })
  }

  const handleDownload = async (scene: Scene) => {
    if (scene.selectedVideoIds.length === 0 && scene.selectedImageIds.length === 0) {
      alert('Please select at least one video or image to download')
      return
    }

    try {
      // Send scenes array with request
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          videoIds: scene.selectedVideoIds,
          imageIds: scene.selectedImageIds,
          scenes: analysis.scenes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        // Handle base64 ZIP download
        const base64Data = data.downloadUrl.replace('data:application/zip;base64,', '')
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/zip' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        alert(data.error || 'Failed to create download')
      }
    } catch (error) {
      alert('Failed to download')
    }
  }

  const hasResults = analysis.scenes.some(s => s.videos.length > 0 || s.images.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Results for {analysis.totalScenes} Scenes</h2>
          <p className="text-gray-600 mt-1">
            Review and select footage for each scene, then download as a ZIP package.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSearchAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching All...
              </>
            ) : (
              'Search All Scenes'
            )}
          </button>
        </div>
      </div>

      {!hasResults && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No footage found yet</h3>
          <p className="mt-2 text-gray-500">Click "Search All Scenes" to find matching stock footage</p>
        </div>
      )}

      <div className="space-y-4">
        {analysis.scenes.map((scene, index) => (
          <ScenePanel
            key={scene.id}
            scene={scene}
            index={index}
            isExpanded={expandedScenes.has(scene.id)}
            onToggle={() => toggleScene(scene.id)}
            onSearch={() => handleSearchScene(scene)}
            onSelectionChange={handleSelectionChange}
            onDownload={() => handleDownload(scene)}
            searching={searchingScene === scene.id}
          />
        ))}
      </div>
    </div>
  )
}

function ScenePanel({
  scene,
  index,
  isExpanded,
  onToggle,
  onSearch,
  onSelectionChange,
  onDownload,
  searching
}: {
  scene: Scene
  index: number
  isExpanded: boolean
  onToggle: () => void
  onSearch: () => void
  onSelectionChange: (sceneId: string, videoIds: string[], imageIds: string[]) => void
  onDownload: () => void
  searching: boolean
}) {
  const [selectedVideos, setSelectedVideos] = useState(scene.selectedVideoIds)
  const [selectedImages, setSelectedImages] = useState(scene.selectedImageIds)
  const [activeTab, setActiveTab] = useState<'videos' | 'images'>('videos')

  const handleVideoSelect = (videoId: string) => {
    const newSelection = selectedVideos.includes(videoId)
      ? selectedVideos.filter(id => id !== videoId)
      : [...selectedVideos, videoId]
    setSelectedVideos(newSelection)
    onSelectionChange(scene.id, newSelection, selectedImages)
  }

  const handleImageSelect = (imageId: string) => {
    const newSelection = selectedImages.includes(imageId)
      ? selectedImages.filter(id => id !== imageId)
      : [...selectedImages, imageId]
    setSelectedImages(newSelection)
    onSelectionChange(scene.id, selectedVideos, newSelection)
  }

  const totalSelected = selectedVideos.length + selectedImages.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg font-bold text-lg">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-gray-900 line-clamp-2">{scene.text}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {scene.keywords.slice(0, 5).map((kw, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{kw}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${totalSelected > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {totalSelected} selected
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          <div className="mb-4 flex gap-2">
            <button
              onClick={onSearch}
              disabled={searching}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {searching ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </>
              ) : (
                'Search Footage'
              )}
            </button>
            {(scene.videos.length > 0 || scene.images.length > 0) && (
              <span className="flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                {scene.videos.length} videos, {scene.images.length} images found
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'videos' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Videos ({scene.videos.length})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'images' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Images ({scene.images.length})
            </button>
          </div>

          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {scene.videos.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No videos found. Click "Search Footage" to find matches.
                </div>
              ) : (
                scene.videos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    selected={selectedVideos.includes(video.id)}
                    onSelect={handleVideoSelect}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {scene.images.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No images found. Click "Search Footage" to find matches.
                </div>
              ) : (
                scene.images.map(image => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    selected={selectedImages.includes(image.id)}
                    onSelect={handleImageSelect}
                  />
                ))
              )}
            </div>
          )}

          {totalSelected > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onDownload}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Selected ({totalSelected} files)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}