import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CANONICAL_DOMAIN = 'https://www.ssglobalpublicschool.com';

const formatCanonicalUrl = (passedUrl, currentPathname) => {
  if (passedUrl) {
    if (passedUrl.startsWith('/')) {
      const cleanPath = passedUrl === '/' ? '/' : passedUrl;
      return `${CANONICAL_DOMAIN}${cleanPath}`;
    }
    // Normalize any passed full URL
    try {
      const urlObj = new URL(passedUrl.replace('https://ssglobalpublicschool.com', CANONICAL_DOMAIN));
      return `${CANONICAL_DOMAIN}${urlObj.pathname}`;
    } catch {
      return passedUrl;
    }
  }

  const cleanPath = currentPathname === '/' ? '/' : currentPathname;
  return `${CANONICAL_DOMAIN}${cleanPath}`;
};

/**
 * Production SEO Component
 * Dynamically updates document title, meta descriptions, keywords, robots tags,
 * canonical links, Open Graph, Twitter Card tags, and JSON-LD structured data.
 */
const SEO = ({
  title = 'S.S. Global Public School | Best CBSE School in Daudnagar, Bihar',
  description = 'S.S. Global Public School in Daudnagar, Bihar offers top quality CBSE education, interactive smart classrooms, science labs, sports, and holistic character development.',
  keywords = 'S.S. Global Public School, S.S. Global Public School Daudnagar, Best School in Daudnagar, Best CBSE School in Daudnagar, CBSE School in Daudnagar, Top School in Daudnagar, School in Daudnagar Bihar, Best School in Aurangabad Bihar, CBSE School in Aurangabad Bihar, admission 2026',
  canonicalUrl,
  ogImage = 'https://www.ssglobalpublicschool.com/school.webp',
  ogType = 'website',
  noindex = false,
  jsonLd = null,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Title Tag
    if (title) {
      document.title = title;
    }

    const updateMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Meta Description
    if (description) {
      updateMetaTag('meta[name="description"]', 'name', 'description', description);
      updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
      updateMetaTag('meta[property="twitter:description"]', 'property', 'twitter:description', description);
    }

    // 3. Meta Keywords
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    // 4. Robots Indexing Directive
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    updateMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);

    // 5. Exact Dynamic Canonical URL based on current route
    const targetCanonical = formatCanonicalUrl(canonicalUrl, location.pathname);

    updateLinkTag('canonical', targetCanonical);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', targetCanonical);
    updateMetaTag('meta[property="twitter:url"]', 'property', 'twitter:url', targetCanonical);

    // 6. Open Graph & Twitter Cards
    if (title) {
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      updateMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', title);
    }

    const resolvedOgImage = ogImage.startsWith('/') ? `${CANONICAL_DOMAIN}${ogImage}` : ogImage;
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', resolvedOgImage);
    updateMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', resolvedOgImage);
    updateMetaTag('meta[property="twitter:card"]', 'property', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'S.S. Global Public School');
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

    // 7. Dynamic Hero LCP Image Preload (Homepage Only)
    let heroPreload = document.querySelector('link[rel="preload"][href="/hero-4.jpg"]');
    if (location.pathname === '/') {
      if (!heroPreload) {
        heroPreload = document.createElement('link');
        heroPreload.setAttribute('rel', 'preload');
        heroPreload.setAttribute('as', 'image');
        heroPreload.setAttribute('href', '/hero-4.jpg');
        heroPreload.setAttribute('type', 'image/jpeg');
        heroPreload.setAttribute('fetchpriority', 'high');
        document.head.appendChild(heroPreload);
      }
    } else if (heroPreload) {
      heroPreload.remove();
    }

    // 8. JSON-LD Dynamic Schema
    let scriptTag = document.querySelector('#dynamic-seo-schema');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noindex, jsonLd, location.pathname]);

  return null;
};

export default SEO;
