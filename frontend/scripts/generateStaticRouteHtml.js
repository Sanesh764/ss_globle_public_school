import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PUBLIC_ROUTE_SEO_LIST } from '../src/utils/seoRoutesConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const defaultDistDir = path.join(frontendRoot, 'dist');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const replaceOrInsertMeta = (html, attrName, attrValue, content) => {
  const escapedContent = escapeHtml(content);
  const regex = new RegExp(
    `<meta\\s+[^>]*${attrName}="${attrValue}"[^>]*>`,
    'i'
  );
  const replacement = `<meta ${attrName}="${attrValue}" content="${escapedContent}" />`;

  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }

  return html.replace('</head>', `    ${replacement}\n  </head>`);
};

const replaceOrInsertCanonical = (html, canonicalUrl) => {
  const escapedUrl = escapeHtml(canonicalUrl);
  const regex = /<link\s+[^>]*rel="canonical"[^>]*>/i;
  const replacement = `<link rel="canonical" href="${escapedUrl}" />`;

  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }

  return html.replace('</head>', `    ${replacement}\n  </head>`);
};

/**
 * Inject route-specific metadata into a built Vite HTML shell without
 * duplicating tags or modifying JS/CSS asset references.
 */
export const applyRouteMetadataToHtml = (baseHtml, routeConfig) => {
  let html = baseHtml;
  const { title, description, canonicalUrl, ogImage } = routeConfig;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceOrInsertMeta(html, 'name', 'description', description);
  html = replaceOrInsertCanonical(html, canonicalUrl);

  html = replaceOrInsertMeta(html, 'property', 'og:title', title);
  html = replaceOrInsertMeta(html, 'property', 'og:description', description);
  html = replaceOrInsertMeta(html, 'property', 'og:url', canonicalUrl);
  html = replaceOrInsertMeta(html, 'property', 'og:image', ogImage);

  html = replaceOrInsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = replaceOrInsertMeta(html, 'name', 'twitter:title', title);
  html = replaceOrInsertMeta(html, 'name', 'twitter:description', description);
  html = replaceOrInsertMeta(html, 'name', 'twitter:url', canonicalUrl);
  html = replaceOrInsertMeta(html, 'name', 'twitter:image', ogImage);

  return html;
};

export const generateStaticRouteHtmlFiles = (distDir = defaultDistDir) => {
  const rootHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(rootHtmlPath)) {
    throw new Error(`Built index.html not found at ${rootHtmlPath}. Run vite build first.`);
  }

  const baseHtml = fs.readFileSync(rootHtmlPath, 'utf8');
  const generatedFiles = [];

  for (const routeConfig of PUBLIC_ROUTE_SEO_LIST) {
    const routeHtml = applyRouteMetadataToHtml(baseHtml, routeConfig);

    if (routeConfig.path === '/') {
      fs.writeFileSync(rootHtmlPath, routeHtml, 'utf8');
      generatedFiles.push(rootHtmlPath);
      continue;
    }

    const segment = routeConfig.path.replace(/^\/+|\/+$/g, '');
    const targetDir = path.join(distDir, segment);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetPath, routeHtml, 'utf8');
    generatedFiles.push(targetPath);
  }

  return generatedFiles;
};

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const files = generateStaticRouteHtmlFiles();
  console.log(`[SEO Static HTML] Generated ${files.length} public route HTML files.`);
}
