import {setRequestLocale, getTranslations} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;

  // Ativar renderização estática
  setRequestLocale(locale);

  // Obter traduções no servidor
  const t = await getTranslations({locale, namespace: 'HomePage'});
  return t('title');
}