// Download Service for Netlify Functions
// Creates ZIP in memory and returns as base64 (no persistent file storage)

import archiver from 'archiver';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { DownloadRequest, DownloadResult, Scene, StockVideo, StockImage } from '../../../utils/types';

export class DownloadService {
  /**
   * Create ZIP in memory and return as base64 string
   */
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

    // Create ZIP in memory
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    return new Promise(async (resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        const base64Zip = zipBuffer.toString('base64');
        resolve({
          downloadUrl: `data:application/zip;base64,${base64Zip}`,
          filename,
          size: zipBuffer.length,
        });
      });
      archive.on('error', (err) => reject(err));

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
}

// Export singleton instance
export const downloadService = new DownloadService();