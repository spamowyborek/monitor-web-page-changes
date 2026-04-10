import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotPath = path.join(__dirname, 'new_screenshot.png');
const baselinePath = path.join(__dirname, 'last_screenshot.png');
const diffPath = path.join(__dirname, 'diff.png');

const url = process.argv[2]?.trim() || process.env.MONITOR_URL?.trim();
const screenshotDelayMs = toPositiveInteger(process.env.SCREENSHOT_DELAY_MS, 2000);
const pixelmatchThreshold = toUnitInterval(process.env.PIXELMATCH_THRESHOLD, 0.1);
const minChangedPixels = toPositiveInteger(process.env.MIN_CHANGED_PIXELS, 100);

if (!url) {
  console.error('Missing URL. Pass it as the first argument or set MONITOR_URL.');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(screenshotDelayMs);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  if (!(await exists(baselinePath))) {
    await fs.copyFile(screenshotPath, baselinePath);
    await removeIfExists(diffPath);
    await writeOutputs({
      status: 'baseline_created',
      changed: 'false',
      baseline_updated: 'true',
      changed_pixels: '0',
      diff_path: '',
      url,
    });
    console.log('Baseline screenshot created.');
    process.exit(0);
  }

  const previous = PNG.sync.read(await fs.readFile(baselinePath));
  const current = PNG.sync.read(await fs.readFile(screenshotPath));
  const width = Math.max(previous.width, current.width);
  const height = Math.max(previous.height, current.height);
  const previousNormalized = normalizeImage(previous, width, height);
  const currentNormalized = normalizeImage(current, width, height);
  const diffImage = new PNG({ width, height });

  const changedPixels = pixelmatch(
    previousNormalized.data,
    currentNormalized.data,
    diffImage.data,
    width,
    height,
    {
      threshold: pixelmatchThreshold,
      includeAA: false,
    },
  );

  if (changedPixels >= minChangedPixels) {
    await fs.writeFile(diffPath, PNG.sync.write(diffImage));
    await fs.copyFile(screenshotPath, baselinePath);
    await writeOutputs({
      status: 'changed',
      changed: 'true',
      baseline_updated: 'true',
      changed_pixels: String(changedPixels),
      diff_path: diffPath,
      url,
    });
    console.log(`Change detected: ${changedPixels} pixels differ.`);
    process.exit(0);
  }

  await removeIfExists(diffPath);
  await writeOutputs({
    status: 'unchanged',
    changed: 'false',
    baseline_updated: 'false',
    changed_pixels: String(changedPixels),
    diff_path: '',
    url,
  });
  console.log(`No meaningful change detected (${changedPixels} differing pixels).`);
} finally {
  await browser.close();
}

function normalizeImage(image, width, height) {
  const normalized = new PNG({ width, height });
  PNG.bitblt(image, normalized, 0, 0, image.width, image.height, 0, 0);
  return normalized;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toUnitInterval(value, fallback) {
  const parsed = Number.parseFloat(value ?? '');
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 1);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function writeOutputs(outputs) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const content = Object.entries(outputs)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.appendFile(process.env.GITHUB_OUTPUT, `${content}\n`);
}
