import { defineMiddleware } from 'astro:middleware';
import { defaultLang } from './i18n/ui';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Se está na raiz (/), redireciona para o idioma preferido
  if (pathname === '/' || pathname === '') {
    // Tenta obter o idioma do cookie
    const localeCookie = context.cookies.get('NEXT_LOCALE')?.value;
    
    // Tenta obter o idioma do Accept-Language header
    const acceptLanguage = context.request.headers.get('accept-language');
    let browserLang = defaultLang;
    
    if (acceptLanguage) {
      const langs = acceptLanguage.split(',').map(lang => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0]; // Pega apenas 'pt' de 'pt-BR'
      });
      
      // Verifica se algum idioma do browser é suportado
      const supportedLangs = ['pt', 'en', 'es'];
      browserLang = langs.find(lang => supportedLangs.includes(lang)) || defaultLang;
    }
    
    // Prioridade: cookie > browser > default
    const targetLang = localeCookie || browserLang;
    
    return context.redirect(`/${targetLang}/blog`, 302);
  }

  // Se está em /blog (sem idioma), redireciona para o idioma preferido
  if (pathname === '/blog' || pathname === '/blog/') {
    const localeCookie = context.cookies.get('NEXT_LOCALE')?.value;
    const acceptLanguage = context.request.headers.get('accept-language');
    let browserLang = defaultLang;
    
    if (acceptLanguage) {
      const langs = acceptLanguage.split(',').map(lang => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0];
      });
      
      const supportedLangs = ['pt', 'en', 'es'];
      browserLang = langs.find(lang => supportedLangs.includes(lang)) || defaultLang;
    }
    
    const targetLang = localeCookie || browserLang;
    
    return context.redirect(`/${targetLang}/blog`, 302);
  }

  return next();
});
