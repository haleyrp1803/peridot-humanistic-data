// Public destinations only. Activation is deliberately separate from preview.
// Never add financial credentials or speculative profile URLs here.
export const PERIDOT_SUPPORT = Object.freeze({
  enabled: true,
  previewInDevelopment: true,
  githubSponsorsUrl: 'https://github.com/sponsors/haleyrp1803',
  kofiUrl: 'https://ko-fi.com/peridot_humanistic_data',
});

const PROVIDERS = Object.freeze([
  { id: 'github', label: 'GitHub Sponsors', description: 'One-time or recurring sponsorship', field: 'githubSponsorsUrl' },
  { id: 'kofi', label: 'Ko-fi', description: 'Pay what you can · Guest-friendly', field: 'kofiUrl' },
]);

// This validates URL shape, not ownership or account readiness. A maintainer
// must separately verify the actual published profiles before enabling support.
function validProfileUrl(value, id) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) return null;
    const valid = id === 'github'
      ? url.hostname === 'github.com' && /^\/sponsors\/[A-Za-z0-9-]+\/?$/.test(url.pathname)
      : url.hostname === 'ko-fi.com' && /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
    return valid ? url.href : null;
  } catch {
    return null;
  }
}

export function resolvePeridotSupport({ development = false, config = PERIDOT_SUPPORT } = {}) {
  const live = config.enabled === true
    ? PROVIDERS.map(({ field, ...provider }) => ({ ...provider, url: validProfileUrl(config[field], provider.id) })).filter(provider => provider.url)
    : [];
  if (live.length) return { visible: true, preview: false, providers: live };
  if (development === true && config.previewInDevelopment === true) {
    return { visible: true, preview: true, providers: PROVIDERS.map(({ field, ...provider }) => ({ ...provider, url: null })) };
  }
  return { visible: false, preview: false, providers: [] };
}
