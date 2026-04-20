'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Groq from 'groq-sdk';

// All UI keys that need translation
const DEFAULT_TRANSLATIONS: Record<string, string> = {
  browse: 'Browse',
  myListings: 'My Listings',
  addListing: 'Add Listing',
  chat: 'Chat',
  aiAssistant: 'AI Assistant',
  login: 'Login / Sign Up',
  signOut: 'Sign out',
  welcomeTitle: 'Welcome to SeedSwap',
  welcomeSubtitle: 'Browse listings to find seeds for your next planting season.',
  searchPlaceholder: 'Search seeds by name, type...',
  filter: 'Filter',
  noSeedsFound: 'No seeds found',
  noSeedsDesc: 'Be the first to add a listing!',
  backToBrowse: 'Back to Browse',
  chatToSwap: 'Chat to Swap',
  edit: 'Edit',
  delete: 'Delete',
  aboutSeed: 'About this seed',
  quantity: 'Quantity',
  swapFor: 'Swap For',
  listed: 'Listed',
  addListingTitle: 'Add a Listing',
  addListingSubtitle: 'Share your seeds with the community.',
  seedPhoto: 'Seed Photo',
  clickToUpload: 'Click to upload an image',
  imageLimit: 'PNG, JPG up to 5MB',
  titleField: 'Title',
  titlePlaceholder: 'e.g., Heirloom Tomato Seeds',
  seedType: 'Seed Type',
  selectType: 'Select a type...',
  description: 'Description',
  descPlaceholder: 'Describe your seeds – variety, growing conditions, harvest info...',
  quantityPlaceholder: 'e.g., 50 seeds, 100g',
  swapPlaceholder: 'e.g., Basil, Chili',
  tags: 'Tags',
  tagsHint: '(comma separated)',
  tagsPlaceholder: 'heirloom, organic, easy-grow',
  createListing: 'Create Listing',
  creating: 'Creating...',
  optional: 'optional',
  myListingsTitle: 'My Listings',
  myListingsSubtitle: 'Manage your seed listings.',
  noListingsYet: 'No listings yet',
  noListingsDesc: 'Start sharing your seeds with the community!',
  createFirst: 'Create your first listing',
  messages: 'Messages',
  noConversations: 'No conversations yet',
  noConversationsDesc: 'Browse listings and click Chat to Swap',
  pleaseLogin: 'Please log in',
  pleaseLoginDesc: 'You need to be logged in to view your messages.',
  typeMessage: 'Type a message...',
  aiTitle: 'AI Gardening Assistant',
  aiSubtitle: 'Your smart guide for all things planting.',
  seedIdentifier: 'Seed Identifier',
  growingTips: 'Growing Tips',
  plantingCalendar: 'Planting Calendar',
  seedIdentifierDesc: 'Upload a photo of a seed to identify it and get planting advice.',
  identifySeed: 'Identify Seed',
  identifying: 'Identifying...',
  growingRecommendations: 'Growing Recommendations',
  seedTypePlaceholder: 'e.g., Tomato, Sunflower',
  locationLabel: 'Location',
  locationPlaceholder: 'e.g., Chennai, India',
  climate: 'Climate',
  climatePlaceholder: 'e.g., tropical, arid',
  getRecommendations: 'Get Recommendations',
  generating: 'Generating...',
  plantingCalendarTitle: 'Planting Calendar',
  generateCalendar: 'Generate Calendar',
  profileTitle: 'My Profile',
  memberSince: 'Member since',
  displayName: 'Display Name',
  emailLabel: 'Email',
  emailCannotChange: 'Email cannot be changed.',
  bioLabel: 'Bio',
  bioPlaceholder: 'Tell the community about your gardening interests...',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  welcomeBack: 'Welcome back! Sign in to continue.',
  joinCommunity: 'Join our seed sharing community.',
  loginTitle: 'Login',
  createAccount: 'Create Account',
  fullName: 'Full Name',
  namePlaceholder: 'Jane Green',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  forgotPassword: 'Forgot Password?',
  signingIn: 'Signing in...',
  creatingAccount: 'Creating account...',
  noAccount: "Don't have an account?",
  signUp: 'Sign up',
  haveAccount: 'Already have an account?',
  logIn: 'Log in',
  vegetable: 'Vegetable',
  fruit: 'Fruit',
  herb: 'Herb',
  flower: 'Flower',
  grain: 'Grain',
  legume: 'Legume',
  spice: 'Spice',
  tree: 'Tree',
  shrub: 'Shrub',
  other: 'Other',
  translating: 'Translating...',
};

interface TranslationContextType {
  t: (key: string) => string;
  lang: string;
  langLabel: string;
  setLanguage: (code: string, label: string) => void;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  t: (k) => DEFAULT_TRANSLATIONS[k] || k,
  lang: 'en',
  langLabel: 'English',
  setLanguage: () => {},
  isTranslating: false,
});

export const useTranslation = () => useContext(TranslationContext);

// Cache translations in memory to avoid re-fetching
const translationCache: Record<string, Record<string, string>> = {
  en: { ...DEFAULT_TRANSLATIONS },
};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState('en');
  const [langLabel, setLangLabel] = useState('English');
  const [translations, setTranslations] = useState<Record<string, string>>(DEFAULT_TRANSLATIONS);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('seedswap_lang');
    const savedLabel = localStorage.getItem('seedswap_lang_label');
    if (savedLang && savedLang !== 'en') {
      setLang(savedLang);
      setLangLabel(savedLabel || savedLang);
      if (translationCache[savedLang]) {
        setTranslations(translationCache[savedLang]);
      } else {
        translateAll(savedLang, savedLabel || savedLang);
      }
    }
  }, []);

  const translateAll = useCallback(async (targetLang: string, targetLabel: string) => {
    // Check cache first
    if (translationCache[targetLang]) {
      setTranslations(translationCache[targetLang]);
      return;
    }

    setIsTranslating(true);
    try {
      const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        console.warn('NEXT_PUBLIC_GROQ_API_KEY not set, using English');
        setIsTranslating(false);
        return;
      }

      const keys = Object.keys(DEFAULT_TRANSLATIONS);
      const values = Object.values(DEFAULT_TRANSLATIONS);

      // Send all translations in one API call
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `Translate the following UI text values to ${targetLabel} language.
Return ONLY a valid JSON object with the same keys but translated values.
Keep translations natural and appropriate for a seed/gardening marketplace app.
Do not add any explanation, markdown, or extra text — just the JSON object.

${JSON.stringify(Object.fromEntries(keys.map((k, i) => [k, values[i]])), null, 2)}`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json|```/g, '').trim();
      const translated = JSON.parse(cleaned);

      // Merge with defaults to ensure no missing keys
      const merged = { ...DEFAULT_TRANSLATIONS, ...translated };
      translationCache[targetLang] = merged;
      setTranslations(merged);
    } catch (error) {
      console.error('Translation failed:', error);
      // Fall back to English
      setTranslations(DEFAULT_TRANSLATIONS);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const setLanguage = useCallback((code: string, label: string) => {
    setLang(code);
    setLangLabel(label);
    localStorage.setItem('seedswap_lang', code);
    localStorage.setItem('seedswap_lang_label', label);

    if (code === 'en') {
      setTranslations(DEFAULT_TRANSLATIONS);
    } else {
      translateAll(code, label);
    }
  }, [translateAll]);

  const t = useCallback((key: string): string => {
    return translations[key] || DEFAULT_TRANSLATIONS[key] || key;
  }, [translations]);

  return (
    <TranslationContext.Provider value={{ t, lang, langLabel, setLanguage, isTranslating }}>
      {isTranslating && (
        <div className="fixed top-4 right-4 z-[9999] bg-brand-500 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Translating...
        </div>
      )}
      {children}
    </TranslationContext.Provider>
  );
}
