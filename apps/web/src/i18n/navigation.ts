import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';
 
// Wrappers leves em torno da navegação do Next.js
// APIs que consideram a configuração de roteamento
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);