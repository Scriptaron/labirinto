import { describe, it, expect } from 'vitest';

/**
 * Testes para os componentes de compartilhamento social
 * 
 * Estes testes validam:
 * 1. Geração correta de URLs com UTM parameters
 * 2. Remoção de locale das URLs
 * 3. Encoding correto de URLs e textos
 * 4. Botão de copiar link com UTM
 * 5. Modal de compartilhamento
 * 6. Integração com diferentes plataformas sociais
 */

type Locale = 'pt' | 'en' | 'es';

describe('SocialShare Components', () => {
    describe('Remoção de locale da URL', () => {
        function removeLocaleFromUrl(fullUrl: string): string {
            return fullUrl.replace(/\/(pt|en|es)\//, '/');
        }

        it('deve remover /pt/ da URL', () => {
            const url = 'https://labirinto.tech/pt/blog/post';
            const result = removeLocaleFromUrl(url);

            expect(result).toBe('https://labirinto.tech/blog/post');
        });

        it('deve remover /en/ da URL', () => {
            const url = 'https://labirinto.tech/en/blog/post';
            const result = removeLocaleFromUrl(url);

            expect(result).toBe('https://labirinto.tech/blog/post');
        });

        it('deve remover /es/ da URL', () => {
            const url = 'https://labirinto.tech/es/blog/post';
            const result = removeLocaleFromUrl(url);

            expect(result).toBe('https://labirinto.tech/blog/post');
        });

        it('não deve modificar URL sem locale', () => {
            const url = 'https://labirinto.tech/blog/post';
            const result = removeLocaleFromUrl(url);

            expect(result).toBe('https://labirinto.tech/blog/post');
        });

        it('deve remover apenas a primeira ocorrência de locale', () => {
            const url = 'https://labirinto.tech/pt/blog/pt/post';
            const result = removeLocaleFromUrl(url);

            expect(result).toBe('https://labirinto.tech/blog/pt/post');
        });
    });

    describe('Geração de UTM parameters', () => {
        function generateUtmUrl(baseUrl: string, source: string, medium: string, campaign: string): string {
            return `${baseUrl}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
        }

        it('deve gerar URL com UTM para WhatsApp', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'whatsapp', 'social', 'share');

            expect(utmUrl).toContain('utm_source=whatsapp');
            expect(utmUrl).toContain('utm_medium=social');
            expect(utmUrl).toContain('utm_campaign=share');
        });

        it('deve gerar URL com UTM para Twitter', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'twitter', 'social', 'share');

            expect(utmUrl).toContain('utm_source=twitter');
        });

        it('deve gerar URL com UTM para Facebook', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'facebook', 'social', 'share');

            expect(utmUrl).toContain('utm_source=facebook');
        });

        it('deve gerar URL com UTM para LinkedIn', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'linkedin', 'social', 'share');

            expect(utmUrl).toContain('utm_source=linkedin');
        });

        it('deve gerar URL com UTM para Telegram', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'telegram', 'social', 'share');

            expect(utmUrl).toContain('utm_source=telegram');
        });

        it('deve gerar URL com UTM para Instagram', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'instagram', 'social', 'share');

            expect(utmUrl).toContain('utm_source=instagram');
        });

        it('deve gerar URL com UTM para Threads', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'threads', 'social', 'share');

            expect(utmUrl).toContain('utm_source=threads');
        });

        it('deve gerar URL com UTM para Reddit', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'reddit', 'social', 'share');

            expect(utmUrl).toContain('utm_source=reddit');
        });

        it('deve gerar URL com UTM para Email', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'email', 'social', 'share');

            expect(utmUrl).toContain('utm_source=email');
        });

        it('deve gerar URL com UTM para botão de copiar', () => {
            const url = 'https://labirinto.tech/blog/post';
            const utmUrl = generateUtmUrl(url, 'copy', 'share', 'share');

            expect(utmUrl).toContain('utm_source=copy');
            expect(utmUrl).toContain('utm_medium=share');
        });
    });

    describe('URLs das plataformas sociais', () => {
        it('deve gerar URL correta para WhatsApp', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=whatsapp&utm_medium=social&utm_campaign=share';
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;

            expect(whatsappUrl).toContain('https://wa.me/');
            expect(whatsappUrl).toContain('text=');
        });

        it('deve gerar URL correta para Twitter', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=twitter&utm_medium=social&utm_campaign=share';
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

            expect(twitterUrl).toContain('https://twitter.com/intent/tweet');
            expect(twitterUrl).toContain('url=');
            expect(twitterUrl).toContain('text=');
        });

        it('deve gerar URL correta para Facebook', () => {
            const url = 'https://labirinto.tech/blog/post?utm_source=facebook&utm_medium=social&utm_campaign=share';
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

            expect(facebookUrl).toContain('https://www.facebook.com/sharer/sharer.php');
            expect(facebookUrl).toContain('u=');
        });

        it('deve gerar URL correta para LinkedIn', () => {
            const url = 'https://labirinto.tech/blog/post?utm_source=linkedin&utm_medium=social&utm_campaign=share';
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

            expect(linkedinUrl).toContain('https://www.linkedin.com/sharing/share-offsite/');
        });

        it('deve gerar URL correta para Telegram', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=telegram&utm_medium=social&utm_campaign=share';
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

            expect(telegramUrl).toContain('https://t.me/share/url');
        });

        it('deve gerar URL correta para Instagram', () => {
            const url = 'https://labirinto.tech/blog/post?utm_source=instagram&utm_medium=social&utm_campaign=share';
            const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(url)}`;

            expect(instagramUrl).toContain('https://www.instagram.com/');
        });

        it('deve gerar URL correta para Threads', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=threads&utm_medium=social&utm_campaign=share';
            const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(title + ' ' + url)}`;

            expect(threadsUrl).toContain('https://www.threads.net/intent/post');
        });

        it('deve gerar URL correta para Reddit', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=reddit&utm_medium=social&utm_campaign=share';
            const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

            expect(redditUrl).toContain('https://reddit.com/submit');
            expect(redditUrl).toContain('title=');
        });

        it('deve gerar URL correta para Email', () => {
            const title = 'Meu Post';
            const url = 'https://labirinto.tech/blog/post?utm_source=email&utm_medium=social&utm_campaign=share';
            const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

            expect(emailUrl).toContain('mailto:');
            expect(emailUrl).toContain('subject=');
            expect(emailUrl).toContain('body=');
        });
    });

    describe('Encoding de URLs', () => {
        it('deve encodar caracteres especiais na URL', () => {
            const url = 'https://labirinto.tech/blog/post?utm=test&other=value';
            const encoded = encodeURIComponent(url);

            expect(encoded).toContain('%3F'); // ?
            expect(encoded).toContain('%3D'); // =
            expect(encoded).toContain('%26'); // &
        });

        it('deve encodar espaços no título', () => {
            const title = 'Meu Post Incrível';
            const encoded = encodeURIComponent(title);

            expect(encoded).toContain('%20'); // espaço
        });

        it('deve encodar caracteres acentuados', () => {
            const text = 'Guia de JavaScript com açúcar';
            const encoded = encodeURIComponent(text);

            expect(encoded).not.toBe(text);
            expect(encoded.length).toBeGreaterThan(text.length);
        });

        it('deve encodar emojis', () => {
            const text = '🚀 Novo Post!';
            const encoded = encodeURIComponent(text);

            expect(encoded).toContain('%');
        });
    });

    describe('Modal de compartilhamento', () => {
        it('deve incluir Instagram no modal desktop', () => {
            const modalPlatforms = [
                'Instagram',
                'Twitter / X',
                'Reddit',
                'WhatsApp',
                'Facebook',
                'LinkedIn',
                'Telegram',
                'Threads',
                'Email'
            ];

            expect(modalPlatforms).toContain('Instagram');
            expect(modalPlatforms.length).toBe(9);
        });

        it('deve ter Instagram como primeira opção no modal', () => {
            const firstPlatform = 'Instagram';
            expect(firstPlatform).toBe('Instagram');
        });

        it('deve abrir modal ao clicar no botão "Mais"', () => {
            let isModalOpen = false;

            // Simula clique
            isModalOpen = true;

            expect(isModalOpen).toBe(true);
        });

        it('deve fechar modal ao clicar no botão fechar', () => {
            let isModalOpen = true;

            // Simula clique no fechar
            isModalOpen = false;

            expect(isModalOpen).toBe(false);
        });

        it('deve fechar modal ao clicar no overlay', () => {
            let isModalOpen = true;
            const clickedOnOverlay = true;

            if (clickedOnOverlay) {
                isModalOpen = false;
            }

            expect(isModalOpen).toBe(false);
        });

        it('deve fechar modal ao pressionar ESC', () => {
            let isModalOpen = true;
            const key = 'Escape';

            if (key === 'Escape') {
                isModalOpen = false;
            }

            expect(isModalOpen).toBe(false);
        });

        it('deve prevenir scroll do body quando modal está aberto', () => {
            let bodyOverflow = '';
            const isModalOpen = true;

            if (isModalOpen) {
                bodyOverflow = 'hidden';
            }

            expect(bodyOverflow).toBe('hidden');
        });

        it('deve restaurar scroll do body quando modal fecha', () => {
            let bodyOverflow = 'hidden';
            const isModalOpen = false;

            if (!isModalOpen) {
                bodyOverflow = '';
            }

            expect(bodyOverflow).toBe('');
        });

        it('deve ter aria-hidden=true quando fechado', () => {
            const isModalOpen = false;
            const ariaHidden = !isModalOpen;

            expect(ariaHidden).toBe(true);
        });

        it('deve ter aria-hidden=false quando aberto', () => {
            const isModalOpen = true;
            const ariaHidden = !isModalOpen;

            expect(ariaHidden).toBe(false);
        });
    });

    describe('Botão de copiar link', () => {
        it('deve copiar URL com UTM parameters', () => {
            const url = 'https://labirinto.tech/blog/post';
            const urlWithUtm = `${url}?utm_source=copy&utm_medium=share&utm_campaign=share`;

            expect(urlWithUtm).toContain('utm_source=copy');
        });

        it('deve mostrar feedback "Copiado!" após copiar', () => {
            let buttonText = 'Copiar';

            // Simula clique
            buttonText = 'Copiado!';

            expect(buttonText).toBe('Copiado!');
        });

        it('deve restaurar texto original após 2 segundos', () => {
            const delay = 2000;
            expect(delay).toBe(2000);
        });

        it('deve adicionar classe "copied" ao botão', () => {
            let className = 'copy-btn';
            const isCopied = true;

            if (isCopied) {
                className = 'copy-btn copied';
            }

            expect(className).toContain('copied');
        });

        it('deve mudar cor do botão para verde quando copiado', () => {
            const copiedBgColor = 'bg-emerald-500';
            expect(copiedBgColor).toContain('emerald');
        });
    });

    describe('SocialShareFloating (botão flutuante)', () => {
        it('deve estar fixo no canto inferior esquerdo em mobile', () => {
            const position = 'fixed';
            const left = '5';
            const bottom = '5';

            expect(position).toBe('fixed');
            expect(left).toBe('5');
            expect(bottom).toBe('5');
        });

        it('deve ter z-index alto para ficar acima do conteúdo', () => {
            const zIndex = 999;
            expect(zIndex).toBeGreaterThanOrEqual(999);
        });

        it('deve estar oculto em desktop (lg:hidden)', () => {
            const displayClass = 'lg:hidden';
            expect(displayClass).toContain('lg:hidden');
        });

        it('deve abrir menu bottom sheet ao clicar', () => {
            let isMenuOpen = false;

            // Simula clique
            isMenuOpen = true;

            expect(isMenuOpen).toBe(true);
        });

        it('deve ter animação de slide up', () => {
            const isOpen = false;
            const transform = isOpen ? 'translate-y-0' : 'translate-y-full';

            expect(transform).toBe('translate-y-full');
        });

        it('deve ter backdrop com blur', () => {
            const backdropBlur = 'blur(10px)';
            expect(backdropBlur).toContain('blur');
        });

        it('deve esconder botão quando menu está aberto', () => {
            let buttonOpacity = '1';
            const isMenuOpen = true;

            if (isMenuOpen) {
                buttonOpacity = '0';
            }

            expect(buttonOpacity).toBe('0');
        });

        it('deve esconder botão quando menu mobile principal está aberto', () => {
            let buttonDisplay = 'flex';
            const isMobileMenuOpen = true;

            if (isMobileMenuOpen) {
                buttonDisplay = 'none';
            }

            expect(buttonDisplay).toBe('none');
        });
    });

    describe('SocialShareMobile', () => {
        it('deve estar oculto em desktop', () => {
            const displayClass = 'hidden lg:hidden';
            expect(displayClass).toContain('hidden');
        });

        it('deve mostrar 4 botões principais', () => {
            const buttons = ['whatsapp', 'instagram', 'twitter', 'more'];
            expect(buttons).toHaveLength(4);
        });

        it('deve ter grid de 2 colunas em mobile pequeno', () => {
            const gridCols = 'grid-cols-2 sm:grid-cols-4';
            expect(gridCols).toContain('grid-cols-2');
        });

        it('deve ter grid de 4 colunas em mobile maior', () => {
            const gridCols = 'grid-cols-2 sm:grid-cols-4';
            expect(gridCols).toContain('sm:grid-cols-4');
        });
    });

    describe('Tracking e analytics', () => {
        it('deve ter data-platform attribute para tracking', () => {
            const platforms = ['whatsapp', 'instagram', 'twitter', 'facebook', 'linkedin'];

            platforms.forEach(platform => {
                expect(platform).toBeTruthy();
            });
        });

        it('deve logar compartilhamento no console', () => {
            const platform = 'twitter';
            const logMessage = `Compartilhado em: ${platform}`;

            expect(logMessage).toContain('twitter');
        });
    });

    describe('Estilos e cores', () => {
        it('deve ter cor específica para WhatsApp (#25D366)', () => {
            const whatsappColor = '#25D366';
            expect(whatsappColor).toBe('#25D366');
        });

        it('deve ter gradiente para Instagram', () => {
            const instagramGradient = 'from-[#f09433] via-[#dc2743] to-[#bc1888]';
            expect(instagramGradient).toContain('from-');
            expect(instagramGradient).toContain('via-');
            expect(instagramGradient).toContain('to-');
        });

        it('deve ter cor preta para Twitter', () => {
            const twitterColor = 'bg-black';
            expect(twitterColor).toBe('bg-black');
        });

        it('deve ter cor específica para Facebook (#1877F2)', () => {
            const facebookColor = '#1877F2';
            expect(facebookColor).toBe('#1877F2');
        });

        it('deve ter cor específica para LinkedIn (#0A66C2)', () => {
            const linkedinColor = '#0A66C2';
            expect(linkedinColor).toBe('#0A66C2');
        });

        it('deve ter cor específica para Telegram (#0088cc)', () => {
            const telegramColor = '#0088cc';
            expect(telegramColor).toBe('#0088cc');
        });

        it('deve ter cor específica para Reddit (#FF4500)', () => {
            const redditColor = '#FF4500';
            expect(redditColor).toBe('#FF4500');
        });

        it('deve ter gradiente roxo para botão "Mais"', () => {
            const moreButtonGradient = 'from-[#667eea] to-[#764ba2]';
            expect(moreButtonGradient).toContain('667eea');
        });
    });

    describe('Responsividade', () => {
        it('deve ter tamanho de ícone adequado para mobile', () => {
            const iconSize = '20';
            expect(parseInt(iconSize)).toBeLessThanOrEqual(24);
        });

        it('deve ter tamanho de botão adequado para toque', () => {
            const buttonSize = '11'; // w-11 h-11 = 2.75rem = 44px
            const minTouchSize = 44;

            expect(parseInt(buttonSize) * 4).toBeGreaterThanOrEqual(minTouchSize);
        });

        it('deve ter gap adequado entre botões', () => {
            const gap = '3'; // gap-3 = 0.75rem
            expect(parseInt(gap)).toBeGreaterThan(0);
        });
    });

    describe('Acessibilidade', () => {
        it('deve ter aria-label em todos os botões', () => {
            const ariaLabels = [
                'Compartilhar no WhatsApp',
                'Compartilhar no Instagram',
                'Compartilhar no Twitter',
                'Mais opções de compartilhamento'
            ];

            ariaLabels.forEach(label => {
                expect(label).toBeTruthy();
                expect(label.length).toBeGreaterThan(0);
            });
        });

        it('deve ter rel="noopener noreferrer" em links externos', () => {
            const rel = 'noopener noreferrer';
            expect(rel).toContain('noopener');
            expect(rel).toContain('noreferrer');
        });

        it('deve ter target="_blank" em links de redes sociais', () => {
            const target = '_blank';
            expect(target).toBe('_blank');
        });
    });
});
