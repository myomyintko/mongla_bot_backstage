export interface SocialValidationResult {
  isValid: boolean
  error?: string
  normalizedUrl?: string
}

export function validateSocialUrl(platform: string, url: string): SocialValidationResult {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' }
  }

  const trimmedUrl = url.trim()

  switch (platform) {
    case 'facebook':
      return validateFacebookUrl(trimmedUrl)
    case 'telegram':
      return validateTelegramUrl(trimmedUrl)
    case 'tiktok':
      return validateTikTokUrl(trimmedUrl)
    case 'whatsapp':
      return validateWhatsAppUrl(trimmedUrl)
    case 'instagram':
      return validateInstagramUrl(trimmedUrl)
    case 'twitter':
      return validateTwitterUrl(trimmedUrl)
    case 'youtube':
      return validateYouTubeUrl(trimmedUrl)
    case 'linkedin':
      return validateLinkedInUrl(trimmedUrl)
    case 'discord':
      return validateDiscordUrl(trimmedUrl)
    case 'snapchat':
      return validateSnapchatUrl(trimmedUrl)
    case 'pinterest':
      return validatePinterestUrl(trimmedUrl)
    case 'reddit':
      return validateRedditUrl(trimmedUrl)
    case 'twitch':
      return validateTwitchUrl(trimmedUrl)
    case 'spotify':
      return validateSpotifyUrl(trimmedUrl)
    case 'apple_music':
      return validateAppleMusicUrl(trimmedUrl)
    default:
      return validateGenericUrl(trimmedUrl)
  }
}

function validateFacebookUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+/,
    /^https?:\/\/(www\.)?fb\.com\/[a-zA-Z0-9.]+/,
    /^[a-zA-Z0-9.]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (!url.startsWith('http')) {
      normalizedUrl = `https://facebook.com/${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid Facebook URL or username' }
}

function validateTelegramUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?t\.me\/[a-zA-Z0-9_]+/,
    /^@?[a-zA-Z0-9_]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (url.startsWith('@')) {
      normalizedUrl = `https://t.me/${url.substring(1)}`
    } else if (!url.startsWith('http')) {
      normalizedUrl = `https://t.me/${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid Telegram URL or username' }
}

function validateTikTokUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+/,
    /^@?[a-zA-Z0-9_.]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (url.startsWith('@')) {
      normalizedUrl = `https://tiktok.com/${url}`
    } else if (!url.startsWith('http')) {
      normalizedUrl = `https://tiktok.com/@${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid TikTok URL or username' }
}

function validateWhatsAppUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?wa\.me\/[0-9+]+/,
    /^\+?[0-9\s\-\(\)]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (!url.startsWith('http')) {
      // Remove all non-digit characters except +
      const phoneNumber = url.replace(/[^\d+]/g, '')
      normalizedUrl = `https://wa.me/${phoneNumber}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid WhatsApp URL or phone number' }
}

function validateInstagramUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/,
    /^@?[a-zA-Z0-9_.]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (url.startsWith('@')) {
      normalizedUrl = `https://instagram.com/${url.substring(1)}`
    } else if (!url.startsWith('http')) {
      normalizedUrl = `https://instagram.com/${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid Instagram URL or username' }
}

function validateTwitterUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+/,
    /^https?:\/\/(www\.)?x\.com\/[a-zA-Z0-9_]+/,
    /^@?[a-zA-Z0-9_]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (url.startsWith('@')) {
      normalizedUrl = `https://twitter.com/${url.substring(1)}`
    } else if (!url.startsWith('http')) {
      normalizedUrl = `https://twitter.com/${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid Twitter URL or username' }
}

function validateYouTubeUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user)\/[a-zA-Z0-9_-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[a-zA-Z0-9_-]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid YouTube URL' }
}

function validateLinkedInUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid LinkedIn URL' }
}

function validateDiscordUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?discord\.gg\/[a-zA-Z0-9]+/,
    /^https?:\/\/(www\.)?discord\.com\/invite\/[a-zA-Z0-9]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Discord invite URL' }
}

function validateSnapchatUrl(url: string): SocialValidationResult {
  const patterns = [
    /^@?[a-zA-Z0-9_.]+$/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    let normalizedUrl = url
    if (!url.startsWith('@')) {
      normalizedUrl = `@${url}`
    }
    return { isValid: true, normalizedUrl }
  }
  
  return { isValid: false, error: 'Invalid Snapchat username' }
}

function validatePinterestUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9_.]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Pinterest URL' }
}

function validateRedditUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?reddit\.com\/(r|u)\/[a-zA-Z0-9_]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Reddit URL' }
}

function validateTwitchUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Twitch URL' }
}

function validateSpotifyUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/open\.spotify\.com\/(artist|album|track|playlist)\/[a-zA-Z0-9]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Spotify URL' }
}

function validateAppleMusicUrl(url: string): SocialValidationResult {
  const patterns = [
    /^https?:\/\/music\.apple\.com\/[a-zA-Z0-9\/-]+/
  ]
  
  if (patterns.some(pattern => pattern.test(url))) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid Apple Music URL' }
}

function validateGenericUrl(url: string): SocialValidationResult {
  const urlPattern = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/
  
  if (urlPattern.test(url)) {
    return { isValid: true, normalizedUrl: url }
  }
  
  return { isValid: false, error: 'Invalid URL format' }
}

export function normalizeSocialUrl(platform: string, url: string): string {
  const result = validateSocialUrl(platform, url)
  return result.normalizedUrl || url
}
