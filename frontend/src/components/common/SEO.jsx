import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CANONICAL_DOMAIN, formatCanonicalUrl } from '../../utils/seoCanonicalUtils';

/**
 * Production SEO Component
 * Dynamically updates document title, meta descriptions, keywords, robots tags,
 * canonical links, Open Graph, Twitter Card tags, and JSON-LD structured data.
 */
const SEO = ({
  title = 'S.S. Global Public School, Daudnagar | CBSE English Medium',
  description = 'S.S. Global Public School is a CBSE-affiliated English medium school in Daudnagar, Aurangabad district, Bihar, offering Classes 1 to 12 with smart classrooms and labs.',
  keywords = '',
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
      updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    // 3. Optional Meta Keywords (removed if empty to avoid keyword stuffing)
    if (keywords && keywords.trim() !== '') {
      updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    } else {
      const existingKeywords = document.querySelector('meta[name="keywords"]');
      if (existingKeywords) {
        existingKeywords.remove();
      }
    }

    // 4. Robots Indexing Directive
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    updateMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);

    // 5. Exact Dynamic Canonical URL (only for indexable pages; remove on noindex pages)
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    if (noindex) {
      existingCanonicals.forEach((el) => el.remove());
    } else {
      const targetCanonical = formatCanonicalUrl(canonicalUrl, location.pathname);
      if (existingCanonicals.length > 1) {
        existingCanonicals.forEach((el, idx) => {
          if (idx > 0) el.remove();
        });
      }
      updateLinkTag('canonical', targetCanonical);
      updateMetaTag('meta[property="og:url"]', 'property', 'og:url', targetCanonical);
      updateMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', targetCanonical);
    }

    // 6. Open Graph & Twitter Cards
    if (title) {
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }

    const resolvedOgImage = ogImage.startsWith('/') ? `${CANONICAL_DOMAIN}${ogImage}` : ogImage;
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', resolvedOgImage);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', resolvedOgImage);
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'S.S. Global Public School');
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

    // 7. Dynamic Hero LCP Image Preload (Homepage Only)
    let heroPreload = document.querySelector('link[rel="preload"][href="/hero-4.webp"]');
    if (location.pathname === '/') {
      if (!heroPreload) {
        heroPreload = document.createElement('link');
        heroPreload.setAttribute('rel', 'preload');
        heroPreload.setAttribute('as', 'image');
        heroPreload.setAttribute('href', '/hero-4.webp');
        heroPreload.setAttribute('type', 'image/webp');
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
