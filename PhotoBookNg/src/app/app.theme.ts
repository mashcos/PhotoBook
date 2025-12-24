import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { PrimeNGConfigType } from 'primeng/config';

// Custom theme with warm Amber/Orange colors for "Summer in Germany" vibe
const SummerTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}',
    },
  },
});

export const theme: PrimeNGConfigType = {
  theme: {
    preset: SummerTheme,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
};
