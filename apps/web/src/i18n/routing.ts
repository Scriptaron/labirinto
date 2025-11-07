import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // Uma lista de todas as localidades suportadas.
  locales: ['pt'],
 
  // Usado quando nenhuma localidade corresponde
  defaultLocale: 'pt'
});