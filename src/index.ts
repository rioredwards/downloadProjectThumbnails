// This script will download the preview images for all projects in the contentful CMS
// and save them to the local filesystem

import { getCodeProjectCardsContent } from './api.js';
import convertGifToPng from 'gif-png-converter';
import dotenv from 'dotenv';

dotenv.config();

const baseDir = process.argv[2] || process.env.CONTENTFUL_PROJECT_PREVIEW_IMAGES_DIR;
if (!baseDir) {
  console.error('Please provide a directory to save the images to');
  process.exit(1);
}

export default async function main(baseDir: string) {
  // Fetch the project content from the contentful CMS
  const projectCardContent = await getCodeProjectCardsContent();

  // Store the paths to the downloaded images
  const newImagePaths: string[] = [];

  // For each project, download the convert the gif into a png
  // and download the png
  for (const project of projectCardContent) {
    const previewImageUrl = project.preview.url;

    // Skip projects without a preview image
    if (!previewImageUrl) continue;

    const filePath = `${baseDir}/${project.slug}`;

    console.log(`Downloading ${previewImageUrl} to ${filePath}\n`);

    try {
      await convertGifToPng(previewImageUrl, filePath);
      newImagePaths.push(filePath);
    } catch (err) {
      console.error(`Error downloading ${previewImageUrl}`, err);
      process.exit(1);
    }
  }
}

main(baseDir);
