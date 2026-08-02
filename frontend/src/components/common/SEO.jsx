import React, { useEffect } from 'react';

/**
 * Production SEO Component
 * Dynamically updates document title, meta descriptions, keywords, robots tags,
 * canonical links, Open Graph, Twitter Card tags, and JSON-LD structured data.
 */
const SEO = ({
  title = 'S.S. Global Public School | Daudnagar, Bihar',
  description = 'S.S. Global Public School in Daudnagar, Bihar offers top quality CBSE education, interactive smart classrooms, science labs, sports, and holistic character development.',
  keywords = 'S.S. Global Public School, Daudnagar, Bihar school, CBSE school Daudnagar, best school in Daudnagar, Top School in Aurangabad Bihar, admission 2026',
  canonicalUrl,
  ogImage = 'https://ssglobalpublicschool.com/school.webp',
  ogType = 'website',
  noindex = false,
  jsonLd = null,
}) => {
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

    // 5. Canonical Link
    const currentCanonical = canonicalUrl || window.location.href.split('?')[0];
    updateLinkTag('canonical', currentCanonical);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentCanonical);

    // 6. Open Graph & Twitter Cards
    if (title) {
      updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
      updateMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', title);
    }
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    updateMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', ogImage);
    updateMetaTag('meta[property="twitter:card"]', 'property', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'S.S. Global Public School');
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

    // 7. JSON-LD Dynamic Schema
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
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noindex, jsonLd]);

  return null;
};

export default SEO;
