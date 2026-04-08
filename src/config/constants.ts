export const COLORS = {
  // Category colors
  land: '#4CAF50',
  landLight: '#E8F5E9',
  sea: '#2196F3',
  seaLight: '#E3F2FD',
  air: '#78909C',
  airLight: '#ECEFF1',

  // Brand colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  secondary: '#FF8F00',
  accent: '#FF6B35',

  // UI
  background: '#FAFAF5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SIZES = {
  cameraButtonHeight: 56,
  bookWidth: 110,
  bookHeight: 130,
  borderRadius: 16,
  borderRadiusSmall: 8,
  padding: 16,
  paddingSmall: 8,
};

export const ANIMAL_SUBCATEGORIES: Record<string, string[]> = {
  land: ['dogs', 'cats', 'horses', 'cattle', 'deer', 'foxes', 'bears', 'elephants', 'lions', 'tigers', 'primates', 'reptiles', 'insects', 'other land'],
  sea: ['fish', 'sharks', 'dolphins', 'whales', 'turtles', 'crabs', 'jellyfish', 'octopus', 'coral', 'other sea'],
  air: ['eagles', 'owls', 'parrots', 'pigeons', 'ducks', 'penguins', 'bats', 'butterflies', 'other air'],
};
