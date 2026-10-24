import archiver from 'archiver';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { DownloadRequest, DownloadResult, Scene, StockVideo, StockImage } from '../../types';

export class DownloadService {
  private downloadsDir: string;

  constructor() {
    this.downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
    }
  }

  async createZip(request: DownloadRequest, scenes: Scene[]): Promise<DownloadResult> {
    const scene = scenes.find(s => s.id === request.sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    const selectedVideos = scene.videos.filter(v => request.videoIds.includes(v.id));
    const selectedImages = scene.images.filter(i => request.imageIds.includes(i.id));

    if (selectedVideos.length === 0 && selectedImages.length === 0) {
      throw new Error('No files selected for download');
    }

    const filename = `stock-footage-${scene.id}-${uuidv4().slice(0, 8)}.zip`;
    const filepath = path.join(this.downloadsDir, filename);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const stats = fs.statSync(filepath);
        resolve({
          downloadUrl: `/api/download/file/${filename}`,
          filename,
          size: stats.size,
        });
      });

      archive.on('error', (err) => reject(err));
      archive.pipe(output);

      // Add videos
      for (const video of selectedVideos) {
        try {
          await this.addFileToArchive(archive, video.downloadUrl, `videos/${video.id}.mp4`);
        } catch (error) {
          console.error(`Failed to add video ${video.id}:`, error);
        }
      }

      // Add images
      for (const image of selectedImages) {
        try {
          await this.addFileToArchive(archive, image.downloadUrl, `images/${image.id}.jpg`);
        } catch (error) {
          console.error(`Failed to add image ${image.id}:`, error);
        }
      }

      // Add a README file
      archive.append(
        this.generateReadme(scene, selectedVideos, selectedImages),
        { name: 'README.txt' }
      );

      archive.finalize();
    });
  }

  private async addFileToArchive(archive: archiver.Archiver, url: string, name: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream', timeout: 60000 });
    archive.append(response.data, { name });
  }

  private generateReadme(scene: Scene, videos: StockVideo[], images: StockImage[]): string {
    const lines = [
      'Stock Footage Finder - Download Package',
      '========================================',
      '',
      `Scene: ${scene.text}`,
      `Keywords: ${scene.keywords.join(', ')}`,
      `Generated: ${new Date().toISOString()}`,
      '',
      'VIDEOS:',
      ...videos.map(v => `  - ${v.id} (${v.source}) - ${v.photographer} - ${v.downloadUrl}`),
      '',
      'IMAGES:',
      ...images.map(i => `  - ${i.id} (${i.source}) - ${i.photographer} - ${i.downloadUrl}`),
      '',
      'All footage is from real stock photography/videography sources.',
      'Please check individual licenses for usage rights.',
    ];
    return lines.join('\n');
  }

  getFilePath(filename: string): string {
    return path.join(this.downloadsDir, filename);
  }

  fileExists(filename: string): boolean {
    return fs.existsSync(this.getFilePath(filename));
  }

  // Cleanup old files (older than 1 hour)
  cleanupOldFiles(): void {
    const files = fs.readdirSync(this.downloadsDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const file of files) {
      const filepath = path.join(this.downloadsDir, file);
      const stats = fs.statSync(filepath);
      if (now - stats.mtimeMs > oneHour) {
        fs.unlinkSync(filepath);
      }
    }
  }
}