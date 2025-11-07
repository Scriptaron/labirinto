import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Corresponder a todos os nomes de caminho, exceto para
  // - … se eles começassem com `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … aquelas que contêm um ponto (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};