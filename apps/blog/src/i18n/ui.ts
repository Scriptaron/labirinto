export const languages = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
} as const;

export const defaultLang = 'pt';

export const ui = {
  pt: {
    'site.title': 'Blog Labirinto',
    'site.description': 'Bem-vindo ao nosso blog!',
    'site.home': 'Início',
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.blog': 'Blog',
    'language.label': 'Idioma',
  },
  en: {
    'site.title': 'Labirinto Blog',
    'site.description': 'Welcome to our blog!',
    'site.home': 'Home',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'language.label': 'Language',
  },
  es: {
    'site.title': 'Blog Labirinto',
    'site.description': '¡Bienvenido a nuestro blog!',
    'site.home': 'Inicio',
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.blog': 'Blog',
    'language.label': 'Idioma',
  },
} as const;

export type UIKey = keyof typeof ui[typeof defaultLang];
