import { useState } from 'react'
import { StockVideo } from '../types'

interface VideoCardProps {
  video: StockVideo
  selected: boolean
  onSelect: (id: string) => void
}

export default function VideoCard({ video, selected, onSelect }: VideoCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-video relative bg-gray-100">
        <img
          src={video.thumbnail}
          alt={`Video from ${video.photographer}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
          </div>
        )}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(video.previewUrl || video.downloadUrl, '_blank')
            }}
            className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="Preview"
          >
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{video.tags.slice(0, 3).join(', ') || 'Stock Video'}</p>
            <p className="text-xs text-gray-500 mt-1">by {video.photographer}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(video.id)
            }}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              selected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {selected ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate">{video.source} • {video.width}x{video.height}</p>
      </div>
    </div>
  )
}