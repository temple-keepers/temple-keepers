/**
 * WhatsApp Integration Utilities for Temple Keepers
 * Uses wa.me deep links — no API key needed
 */

// ─── Configuration ───────────────────────────────────────────────
const WHATSAPP_CONFIG = {
  // ⚠️ DENISE: Replace these with your actual WhatsApp links
  // 1. Create a WhatsApp group → Settings → Invite link → Copy
  // 2. Create a WhatsApp Channel → WhatsApp Business → Channels → Create
  // 3. Your WhatsApp Business number (digits only, with country code 44, no +)
  foundingMembersGroup: 'https://chat.whatsapp.com/BxAoHjS6XYdL56wbE3uBpv?mode=gi_t',
  communityChannel: 'https://whatsapp.com/channel/0029VbCYTT00rGiDdshHkL3Z',
  businessNumber: '447939122331',
}

// ─── Core Functions ──────────────────────────────────────────────

/**
 * Open WhatsApp with a pre-filled message
 */
export const sendWhatsAppMessage = (phoneNumber, message) => {
  const encoded = encodeURIComponent(message)
  const url = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank')
}

/**
 * Share content via WhatsApp (no specific recipient)
 */
export const shareOnWhatsApp = (message) => {
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

/**
 * Open the founding members WhatsApp group
 */
export const joinFoundingMembersGroup = () => {
  window.open(WHATSAPP_CONFIG.foundingMembersGroup, '_blank')
}

/**
 * Open the WhatsApp broadcast channel
 */
export const joinWhatsAppChannel = () => {
  window.open(WHATSAPP_CONFIG.communityChannel, '_blank')
}

/**
 * Contact Denise directly on WhatsApp
 */
export const contactOnWhatsApp = (message = '') => {
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${WHATSAPP_CONFIG.businessNumber}?text=${encoded}`, '_blank')
}

// ─── Pre-built Share Messages ────────────────────────────────────

export const whatsappMessages = {
  /**
   * Invite a friend to join Temple Keepers
   */
  inviteFriend: (userName) =>
    `Hey! 👋 I've been using Temple Keepers — it's a free faith-based wellness app with daily scripture, healthy recipes, and community support.\n\n` +
    `${userName ? `${userName} here — ` : ''}I thought you might enjoy it!\n\n` +
    `🙏 Daily devotionals connecting faith & wellness\n` +
    `🍽️ AI-powered healthy recipes\n` +
    `💪 Guided programmes & challenges\n` +
    `👥 Community accountability pods\n\n` +
    `Join free: https://templekeepers.app/signup`,

  /**
   * Share a streak achievement
   */
  streakMilestone: (days) =>
    `🔥 I just hit a ${days}-day streak on Temple Keepers!\n\n` +
    `Daily scripture, healthy eating, and honouring the temple God gave me — one day at a time.\n\n` +
    `"Do you not know that your body is the temple of the Holy Spirit?" — 1 Cor 6:19\n\n` +
    `Join me: https://templekeepers.app/signup`,

  /**
   * Share a programme day completion
   */
  programDayComplete: (programmeName, dayNumber, totalDays) =>
    `✅ Day ${dayNumber}/${totalDays} of "${programmeName}" complete on Temple Keepers!\n\n` +
    `Faith-based wellness, one day at a time. 💪🙏\n\n` +
    `Join the journey: https://templekeepers.app/signup`,

  /**
   * Share a programme completion
   */
  programComplete: (programmeName) =>
    `🎉 I just completed "${programmeName}" on Temple Keepers!\n\n` +
    `${programmeName.includes('Sugar') ? '30 days sugar-free with daily scripture and science. My body feels incredible!' : `What an incredible journey of faith and wellness!`}\n\n` +
    `If you've been thinking about making a change, this is the app: https://templekeepers.app/signup`,

  /**
   * Share a recipe
   */
  shareRecipe: (recipeTitle, recipeUrl) =>
    `🍽️ Just found this amazing healthy recipe on Temple Keepers:\n\n` +
    `*${recipeTitle}*\n\n` +
    `Every recipe comes with scripture, nutrition info, and healthy ingredient swaps. 🙌\n\n` +
    `Check it out: ${recipeUrl || 'https://templekeepers.app/signup'}`,

  /**
   * Invite to No Sugar Challenge
   */
  noSugarChallenge: () =>
    `Hey! 💛 I'm doing a 30-Day No Sugar Challenge on Temple Keepers starting in March.\n\n` +
    `Every day you get:\n` +
    `🙏 Scripture connecting faith & your body\n` +
    `🔬 The science of what's happening inside you\n` +
    `✅ A simple action step\n` +
    `💬 Community support\n\n` +
    `It's completely free. Want to join me?\n\n` +
    `Sign up: https://templekeepers.app/signup`,

  /**
   * Share a level up
   */
  levelUp: (level, levelName) =>
    `🏆 Just levelled up to ${levelName} (Level ${level}) on Temple Keepers!\n\n` +
    `Honouring God's temple one day at a time. 🙏\n\n` +
    `Join the journey: https://templekeepers.app/signup`,
}

export default WHATSAPP_CONFIG
