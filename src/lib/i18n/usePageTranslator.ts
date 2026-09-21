'use client';

import React, { useEffect } from 'react';
import { TRANSLATIONS } from './translations';
import { DEFAULT_LANGUAGE } from './languages';

// Cache keys sorted by length (descending) so longer phrases match before substrings
const SORTED_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const THAI_REGEX = /[\u0E00-\u0E7F]/;

// Store original Thai text in a WeakMap keyed on the node
// key = original Thai value, resets whenever React pushes new Thai content
const ORIGINAL_MAP = new WeakMap<Node, string>();

// The last lang that was applied to this node (to avoid redundant DOM writes)
const LAST_LANG_MAP = new WeakMap<Node, string>();
const LAST_VAL_MAP = new WeakMap<Node, string>();

let originalDocTitle: string | null = null;

/**
 * Translate a Thai string into targetLang.
 * Works by repeatedly matching the longest-known phrase and replacing it.
 * Thai fragments with NO translation entry are replaced with an empty string
 * rather than left in Thai — so the result is never a mix of Thai + target lang.
 */
function translateString(text: string, targetLang: string): string {
  if (!text || targetLang === 'th') return text;
  if (!THAI_REGEX.test(text)) return text; // not Thai, pass through

  let translated = text;
  for (let i = 0; i < SORTED_KEYS.length; i++) {
    const key = SORTED_KEYS[i];
    if (translated.includes(key) && TRANSLATIONS[key]?.[targetLang]) {
      translated = translated.split(key).join(TRANSLATIONS[key][targetLang]);
    }
  }

  // If the result still contains Thai characters, it means there were phrases
  // that had no translation entry. Remove the remaining Thai fragments so we
  // never show a mix like "承認待ち รออนุมัติ" — instead show just "承認待ち".
  if (THAI_REGEX.test(translated)) {
    // Remove contiguous Thai word groups, keeping surrounding non-Thai content
    translated = translated.replace(/[\u0E00-\u0E7F\s]*[\u0E00-\u0E7F][\u0E00-\u0E7F\s]*/g, (match) => {
      // Keep if it's only whitespace
      return match.replace(/[\u0E00-\u0E7F]+/g, '').trim();
    }).replace(/\s{2,}/g, ' ').trim();
  }

  return translated;
}

export function usePageTranslator() {
  useEffect(() => {
    let isTranslating = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const getLang = (): string =>
      (typeof localStorage !== 'undefined' ? localStorage.getItem('app_lang') : null) ||
      DEFAULT_LANGUAGE;

    /** Translate a single text node */
    const translateTextNode = (node: Node, lang: string) => {
      const raw = node.nodeValue || '';
      if (!raw.trim()) return;

      const currentIsThai = THAI_REGEX.test(raw);

      // ─── Determine the "original Thai" for this node ───────────────────
      let original = ORIGINAL_MAP.get(node);

      if (original === undefined) {
        // First time seeing this node
        original = raw;
        ORIGINAL_MAP.set(node, original);
      } else if (currentIsThai) {
        // React re-rendered with new Thai content (e.g. after data fetch)
        const lastVal = LAST_VAL_MAP.get(node);
        if (raw !== lastVal) {
          // React pushed genuinely new Thai text — update origin
          original = raw;
          ORIGINAL_MAP.set(node, original);
        }
      } else {
        // Node currently holds a non-Thai translated value
        // If the original we stored IS Thai, keep using it as the source
        if (!THAI_REGEX.test(original)) {
          // original itself is not Thai — nothing to translate
          return;
        }
        // Use the stored Thai original below
      }

      // ─── Apply or revert ────────────────────────────────────────────────
      if (lang === 'th') {
        // Restore to original Thai
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
        LAST_VAL_MAP.set(node, original);
        LAST_LANG_MAP.set(node, lang);
        return;
      }

      // Translate from original Thai
      const translated = translateString(original, lang);

      if (node.nodeValue !== translated) {
        node.nodeValue = translated;
      }
      LAST_VAL_MAP.set(node, translated);
      LAST_LANG_MAP.set(node, lang);
    };

    /** Translate placeholder/title/aria-label attributes on an element */
    const translateAttrs = (el: Element, lang: string) => {
      const ATTRS = ['placeholder', 'title', 'aria-label'];
      for (const attr of ATTRS) {
        const val = el.getAttribute(attr);
        if (!val) continue;

        const dataKey = `data-orig-${attr}`;
        let orig = el.getAttribute(dataKey);

        if (!orig) {
          if (THAI_REGEX.test(val)) {
            orig = val;
            el.setAttribute(dataKey, orig);
          } else {
            continue;
          }
        } else if (THAI_REGEX.test(val) && val !== orig) {
          // React refreshed with new Thai attr value
          orig = val;
          el.setAttribute(dataKey, orig);
        }

        const target = lang === 'th' ? orig : translateString(orig, lang);
        if (val !== target) el.setAttribute(attr, target);
      }
    };

    /** Walk the DOM tree and translate every text node + attribute */
    const walk = (node: Node, lang: string) => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node, lang);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as HTMLElement;
      const tag = el.tagName;

      // Skip non-content elements
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'IFRAME'].includes(tag)) return;

      // Translate attributes
      translateAttrs(el, lang);

      // Recurse into children
      for (let i = 0; i < el.childNodes.length; i++) {
        walk(el.childNodes[i], lang);
      }
    };

    const applyTranslation = () => {
      if (typeof window === 'undefined' || !document.body) return;
      const lang = getLang();

      // Update <html lang="...">
      try { document.documentElement.lang = lang; } catch (_) {}

      // Translate <title>
      try {
        if (originalDocTitle === null && document.title) originalDocTitle = document.title;
        if (originalDocTitle) {
          document.title = lang === 'th' ? originalDocTitle : translateString(originalDocTitle, lang);
        }
      } catch (_) {}

      isTranslating = true;
      try {
        walk(document.body, lang);
      } catch (e) {
        console.error('[i18n] Translation walk error:', e);
      } finally {
        setTimeout(() => { isTranslating = false; }, 60);
      }
    };

    // Run immediately
    applyTranslation();

    // Watch for DOM changes (React renders, data loads, etc.)
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;

      // Only retranslate if there is actually Thai text in what changed
      const hasThai = mutations.some((m) => {
        if (m.type === 'characterData') {
          return THAI_REGEX.test(m.target.nodeValue || '');
        }
        if (m.type === 'childList') {
          return Array.from(m.addedNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE
              ? THAI_REGEX.test(n.nodeValue || '')
              : (n as Element).textContent
                ? THAI_REGEX.test((n as Element).textContent || '')
                : false
          );
        }
        return false;
      });

      if (!hasThai && getLang() === 'th') return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyTranslation();
      }, 50);
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
