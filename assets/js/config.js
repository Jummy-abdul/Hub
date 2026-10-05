/*
 * Fixiam Documentation — information architecture config.
 *
 * Everything the shell needs to know about the top-level structure lives here.
 * The header nav, breadcrumbs, search grouping and footer are all generated from
 * SECTIONS and TYPES, so adding a new top-level section (for example a future
 * "Developers" area) is a config change plus a content file, not a redesign.
 */
window.FX = window.FX || {};

// Primary navigation, in display order.
FX.SECTIONS = [
  { id: 'home', label: 'Home', route: '/' },
  { id: 'concept', label: 'Concepts', route: '/concepts' },
  { id: 'guide', label: 'Guides', route: '/guides' },
  { id: 'journey', label: 'Journeys', route: '/journeys' },
  { id: 'release', label: 'Release Notes', route: '/release-notes' },
  // Future section. Uncomment, add a TYPES entry and a content/developers.js file:
  // { id: 'developer', label: 'Developers', route: '/developers' },
];

// Content types. Each type has one page template and one landing template.
FX.TYPES = {
  concept: {
    label: 'Concept',
    plural: 'Concepts',
    tagline: 'Teach me',
    base: '/concepts',
    intro: 'Concepts explain what something is and how it works. Read them to understand an idea before you configure it.',
    notFor: 'Looking for step by step instructions? Concept pages link to the guides that put each idea into practice.',
  },
  guide: {
    label: 'Guide',
    plural: 'Guides',
    tagline: 'Show me how',
    base: '/guides',
    intro: 'Guides are task-focused instructions. Each one helps you complete a single job in the Fixiam Admin Console.',
    notFor: 'Want the background first? Every guide links to the concepts it relies on.',
  },
  journey: {
    label: 'Journey',
    plural: 'Journeys',
    tagline: 'Take me from beginning to end',
    base: '/journeys',
    intro: 'Journeys combine concepts and guides into an end to end implementation path for a larger outcome.',
    notFor: 'Each stage tells you what to learn and what to do, and links to the concept and guide pages for each.',
  },
  release: {
    label: 'Release note',
    plural: 'Release Notes',
    tagline: "What's changed?",
    base: '/release-notes',
    intro: 'Release notes list what is new, improved and fixed in Fixiam, newest first.',
    notFor: '',
  },
};

// Release note categories.
FX.RN_CATEGORIES = {
  new: { label: 'New', desc: 'A capability that was not available before.' },
  improved: { label: 'Improved', desc: 'A change that makes an existing capability better.' },
  fixed: { label: 'Fixed', desc: 'A defect that has been corrected.' },
  security: { label: 'Security', desc: 'A change that affects the security posture of your organization.' },
};

FX.SITE = {
  name: 'Fixiam Documentation',
  tagline: 'Learn how to configure, manage and get the most out of Fixiam.',
  today: '2026-10-05',
};

// Search synonyms. Each key also matches the listed phrases.
FX.SYNONYMS = {
  sso: ['single sign on', 'single sign-on', 'saml', 'oidc'],
  mfa: ['multi factor', 'multi-factor', '2fa', 'two factor', 'totp', 'authenticator'],
  '2fa': ['mfa', 'multi factor'],
  ad: ['active directory'],
  hr: ['hr source', 'sagehr', 'seamlesshr', 'human resources'],
  oidc: ['openid connect', 'openid'],
  device: ['devices', 'endpoint', 'laptop', 'enroll', 'compliance'],
  user: ['users', 'people', 'employee', 'account', 'identity'],
  jml: ['joiner', 'mover', 'leaver'],
  biometric: ['portrait', 'fingerprint', 'face'],
  pam: ['privileged access'],
  role: ['roles', 'permissions', 'rbac'],
  onboarding: ['joiner', 'provisioning'],
  offboarding: ['leaver', 'deprovisioning', 'deactivate'],
};

FX.POPULAR_SEARCHES = ['SSO', 'MFA', 'device', 'user', 'SAML', 'SCIM'];
