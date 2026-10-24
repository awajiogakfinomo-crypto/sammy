import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ScriptAnalysisService } from '../services/scriptAnalysis';
import { StockApiManager } from '../services/stockApis';
import { DownloadService } from '../services/download';
import { ApiConfig, Scene, ScriptAnalysisResult, SearchResult } from '../types';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

let scriptAnalysisService: ScriptAnalysisService;
let stockApiManager: StockApiManager;
let downloadService: DownloadService;
let currentAnalysis: ScriptAnalysisResult | null = null;

export function initializeServices(config: ApiConfig) {
  scriptAnalysisService = new ScriptAnalysisService();
  stockApiManager = new StockApiManager(config);
  downloadService = new DownloadService();
}

// Analyze script
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { script } = req.body;
    if (!script || typeof script !== 'string') {
      return res.status(400).json({ error: 'Script is required' });
    }

    currentAnalysis = scriptAnalysisService.analyze(script);
    res.json(currentAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze script' });
  }
});

// Search footage for a scene
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { sceneId, queries } = req.body;

    if (!currentAnalysis) {
      return res.status(400).json({ error: 'No script analyzed yet' });
    }

    const scene = currentAnalysis.scenes.find(s => s.id === sceneId);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const searchQueries = queries || scene.searchQueries;
    const allResults: SearchResult[] = [];

    for (const query of searchQueries) {
      const results = await stockApiManager.searchAll(query);
      allResults.push(...results);
    }

    // Deduplicate by ID
    const videoMap = new Map<string, any>();
    const imageMap = new Map<string, any>();

    for (const result of allResults) {
      for (const video of result.videos) {
        if (!videoMap.has(video.id)) videoMap.set(video.id, video);
      }
      for (const image of result.images) {
        if (!imageMap.has(image.id)) imageMap.set(image.id, image);
      }
    }

    scene.videos = Array.from(videoMap.values());
    scene.images = Array.from(imageMap.values());

    res.json({ scene });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search footage' });
  }
});

// Search all scenes
router.post('/search-all', async (req: Request, res: Response) => {
  try {
    if (!currentAnalysis) {
      return res.status(400).json({ error: 'No script analyzed yet' });
    }

    const results = await Promise.all(
      currentAnalysis.scenes.map(async (scene) => {
        const allResults: SearchResult[] = [];
        for (const query of scene.searchQueries) {
          const results = await stockApiManager.searchAll(query);
          allResults.push(...results);
        }

        const videoMap = new Map<string, any>();
        const imageMap = new Map<string, any>();

        for (const result of allResults) {
          for (const video of result.videos) {
            if (!videoMap.has(video.id)) videoMap.set(video.id, video);
          }
          for (const image of result.images) {
            if (!imageMap.has(image.id)) imageMap.set(image.id, image);
          }
        }

        scene.videos = Array.from(videoMap.values());
        scene.images = Array.from(imageMap.values());

        return { sceneId: scene.id, videoCount: scene.videos.length, imageCount: scene.images.length };
      })
    );

    res.json({ scenes: currentAnalysis.scenes, results });
  } catch (error) {
    console.error('Search all error:', error);
    res.status(500).json({ error: 'Failed to search footage for all scenes' });
  }
});

// Get current analysis
router.get('/analysis', (req: Request, res: Response) => {
  if (!currentAnalysis) {
    return res.status(404).json({ error: 'No script analyzed yet' });
  }
  res.json(currentAnalysis);
});

// Update scene selections
router.post('/select', (req: Request, res: Response) => {
  try {
    const { sceneId, videoIds, imageIds } = req.body;

    if (!currentAnalysis) {
      return res.status(400).json({ error: 'No script analyzed yet' });
    }

    const scene = currentAnalysis.scenes.find(s => s.id === sceneId);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    scene.selectedVideoIds = videoIds || [];
    scene.selectedImageIds = imageIds || [];

    res.json({ scene });
  } catch (error) {
    console.error('Selection error:', error);
    res.status(500).json({ error: 'Failed to update selection' });
  }
});

// Download selected footage
router.post('/download', async (req: Request, res: Response) => {
  try {
    const { sceneId, videoIds, imageIds } = req.body;

    if (!currentAnalysis) {
      return res.status(400).json({ error: 'No script analyzed yet' });
    }

    const result = await downloadService.createZip({ sceneId, videoIds, imageIds }, currentAnalysis.scenes);
    res.json(result);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to create download' });
  }
});

// Serve download file
router.get('/download/file/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filepath = downloadService.getFilePath(filename);

  if (!downloadService.fileExists(filename)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Download file error:', err);
    }
  });
});

// Analyze script from file upload
router.post('/analyze-file', upload.single('script'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const script = req.file.buffer.toString('utf-8');
    currentAnalysis = scriptAnalysisService.analyze(script);
    res.json(currentAnalysis);
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze script file' });
  }
});

export default router;