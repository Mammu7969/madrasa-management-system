export * from './FontShowcaseModal';
import './fonts.css';

export interface LocalFontInfo {
  id: string;
  name: string;
  family: string;
  category: 'urdu' | 'quran' | 'english';
  weight: string;
  isCalligraphic?: boolean;
}

export const AVAILABLE_LOCAL_FONTS: LocalFontInfo[] = [
  // Urdu Nastaliq
  { id: 'jameel', name: 'Jameel Noori Nastaleeq', family: "'Jameel Noori Nastaleeq', serif", category: 'urdu', weight: 'Normal', isCalligraphic: true },
  { id: 'kasheeda', name: 'Jameel Noori Kasheeda', family: "'Jameel Noori Kasheeda', serif", category: 'urdu', weight: 'Normal', isCalligraphic: true },
  { id: 'sameer', name: 'AA Sameer Sagar Nastaleeq Bold', family: "'AA Sameer Sagar', serif", category: 'urdu', weight: 'Bold', isCalligraphic: true },
  { id: 'alqalam', name: 'AlQalam Taj Nastaleeq', family: "'AlQalam Taj', serif", category: 'urdu', weight: 'Normal', isCalligraphic: true },
  { id: 'faiz', name: 'Faiz Lahori Nastaleeq', family: "'Faiz Lahori', serif", category: 'urdu', weight: 'Normal', isCalligraphic: true },

  // Quranic & Arabic
  { id: 'quran', name: 'QuranFont-Original', family: "'QuranFont-Original', '_PDMS_Saleem_QuranFont', 'QuranFont', serif", category: 'quran', weight: 'Normal', isCalligraphic: true },
  { id: 'alyamama', name: 'Alyamama Modern Arabic', family: "'Alyamama', sans-serif", category: 'quran', weight: 'Variable (Light to Black)' },
  { id: 'trad-arabic', name: 'Traditional Arabic Bold', family: "'Traditional Arabic', serif", category: 'quran', weight: 'Bold' },

  // English & Numerals
  { id: 'bebas', name: 'Bebas Neue Pro', family: "'Bebas Neue Pro', sans-serif", category: 'english', weight: 'Regular & Bold' },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif", category: 'english', weight: 'Regular, Medium, Bold' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'english', weight: 'Regular to Black' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", category: 'english', weight: 'Thin to Black' }
];
