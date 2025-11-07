import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/src/i18n/routing';
 
type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>
};
 
export default async function LocaleLayout({children, params}: Props) {
  // Garanta que o `locale` de entrada seja válido
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)){
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}