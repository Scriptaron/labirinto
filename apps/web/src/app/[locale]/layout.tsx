import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './globals.css';
 
type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>
};
 
export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)){
    notFound();
  }
  // Ativar renderização estática
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <header className="p-4 border-b">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Labirinto</h1>
              <LanguageSwitcher />
            </div>
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}