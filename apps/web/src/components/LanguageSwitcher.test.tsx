import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSwitcher from './LanguageSwitcher';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'pt',
}));

// Mock navigation
const mockReplace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/current-path',
}));

// Mock config
vi.mock('@labirinto/i18n-config', () => ({
  locales: ['pt', 'en', 'es'],
  localeNames: {
    pt: 'Português',
    en: 'English',
    es: 'Español',
  },
}));

describe('LanguageSwitcher', () => {
  it('renders correctly with current locale', () => {
    render(<LanguageSwitcher />);
    
    // Should show current locale name
    expect(screen.getByText('Português')).toBeDefined();
  });

  it('opens dropdown when clicked', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByRole('button', { name: 'label' });
    fireEvent.click(button);

    // Should show other options
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('Español')).toBeDefined();
  });

  it('changes locale when option is clicked', () => {
    render(<LanguageSwitcher />);
    
    // Open dropdown
    const button = screen.getByRole('button', { name: 'label' });
    fireEvent.click(button);

    // Click English
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    // Should call router.replace
    expect(mockReplace).toHaveBeenCalledWith('/current-path', { locale: 'en' });
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSwitcher />);
    
    // Open dropdown
    const button = screen.getByRole('button', { name: 'label' });
    fireEvent.click(button);
    expect(screen.getByText('English')).toBeDefined();

    // Click outside
    fireEvent.mouseDown(document.body);

    // Dropdown should be closed (English option not visible/in document)
    // Note: In standard testing-library, elements are removed from DOM.
    // queryByText returns null if not found.
    expect(screen.queryByText('English')).toBeNull();
  });
});
