'use client';

import React, { useEffect } from 'react';
import { TRANSLATIONS } from './translations';
import { DEFAULT_LANGUAGE } from './languages';

// Cache keys sorted by length (descending) so longer phrases match before substrings
const SORTED_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const THAI_REGEX = /[\u0E00-\u0E7F]/;

const ORIGINAL_TEXT_MAP = new WeakMap<Node, string>();
const LAST_TRANSLATED_MAP = new WeakMap<Node, string>();
const ORIGINAL_ATTR_MAP = new WeakMap<Element, Record<string, string>>();
const LAST_TRANSLATED_ATTR_MAP = new WeakMap<Element, Record<string, string>>();

let originalDocTitle: string | null = null;

function translateString(text: string, targetLang: string): string {
  if (!text || targetLang === 'th' || !THAI_REGEX.test(text)) return text;
  let translated = text;
  for (let i = 0; i < SORTED_KEYS.length; i++) {
    const key = SORTED_KEYS[i];
    if (translated.includes(key) && TRANSLATIONS[key][targetLang]) {
      translated = translated.split(key).join(TRANSLATIONS[key][targetLang]);
    }
  }
  return translated;
}

export function usePageTranslator() {
  useEffect(() => {
    let isTranslating = false;
    let debounceTimer: any = null;

    const applyTranslation = () => {
      if (typeof window === 'undefined' || !document.body) return;
      const currentLang = localStorage.getItem('app_lang') || DEFAULT_LANGUAGE;

      // Update HTML lang attribute
      try {
        document.documentElement.lang = currentLang;
      } catch (e) {}

      // Translate document.title
      try {
        if (originalDocTitle === null && document.title) {
          originalDocTitle = document.title;
        }
        if (originalDocTitle) {
          if (currentLang === 'th') {
            document.title = originalDocTitle;
          } else {
            document.title = translateString(originalDocTitle, currentLang);
          }
        }
      } catch (e) {}

      isTranslating = true;

      const walkTextNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const currentVal = node.nodeValue || '';
          if (!currentVal.trim()) return;

          let original = ORIGINAL_TEXT_MAP.get(node);
          const hasThai = THAI_REGEX.test(currentVal);

          if (original === undefined) {
            original = currentVal;
            ORIGINAL_TEXT_MAP.set(node, original);
          } else if (hasThai) {
            const lastTrans = LAST_TRANSLATED_MAP.get(node);
            // If React re-rendered with new Thai content
            if (currentVal !== original && currentVal !== lastTrans) {
              original = currentVal;
              ORIGINAL_TEXT_MAP.set(node, original);
            }
          }

          if (currentLang === 'th') {
            if (node.nodeValue !== original) {
              node.nodeValue = original;
            }
            LAST_TRANSLATED_MAP.set(node, original);
            return;
          }

          // Translate from original Thai text
          const translated = translateString(original, currentLang);

          if (node.nodeValue !== translated) {
            node.nodeValue = translated;
          }
          LAST_TRANSLATED_MAP.set(node, translated);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (['SCRIPT', 'STYLE', 'CODE'].includes(el.tagName)) return;

          // Attributes: placeholder, title, aria-label
          const targetAttrs = ['placeholder', 'title', 'aria-label'];
          let origAttrs = ORIGINAL_ATTR_MAP.get(el);
          if (!origAttrs) {
            origAttrs = {};
            ORIGINAL_ATTR_MAP.set(el, origAttrs);
          }
          let lastAttrs = LAST_TRANSLATED_ATTR_MAP.get(el);
          if (!lastAttrs) {
            lastAttrs = {};
            LAST_TRANSLATED_ATTR_MAP.set(el, lastAttrs);
          }

          for (const attr of targetAttrs) {
            const val = el.getAttribute(attr);
            if (val) {
              const hasThai = THAI_REGEX.test(val);
              if (origAttrs[attr] === undefined) {
                origAttrs[attr] = val;
              } else if (hasThai && val !== origAttrs[attr] && val !== lastAttrs[attr]) {
                origAttrs[attr] = val;
              }

              const orig = origAttrs[attr];
              if (currentLang === 'th') {
                if (val !== orig) el.setAttribute(attr, orig);
                lastAttrs[attr] = orig;
              } else {
                const trans = translateString(orig, currentLang);
                if (val !== trans) el.setAttribute(attr, trans);
                lastAttrs[attr] = trans;
              }
            }
          }

          // Traverse child nodes
          for (let i = 0; i < el.childNodes.length; i++) {
            walkTextNodes(el.childNodes[i]);
          }
        }
      };

      try {
        walkTextNodes(document.body);
      } catch (e) {
        console.error('Translation walk error:', e);
      } finally {
        setTimeout(() => {
          isTranslating = false;
        }, 50);
      }
    };

    // Run translation immediately
    applyTranslation();

    // Re-apply on dynamic changes with debounce
    const observer = new MutationObserver(() => {
      if (isTranslating) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyTranslation();
      }, 40);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('language_changed', applyTranslation);
    window.addEventListener('popstate', applyTranslation);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      window.removeEventListener('language_changed', applyTranslation);
      window.removeEventListener('popstate', applyTranslation);
    };
  }, []);
}

export function GlobalTranslator(): React.ReactNode {
  usePageTranslator();
  return null;
}

