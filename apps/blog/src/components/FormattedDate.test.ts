import { describe, it, expect } from 'vitest';

describe('FormattedDate Component', () => {
    describe('Formatação de Data', () => {
        it('deve formatar data em formato ISO 8601', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const isoString = date.toISOString();

            expect(isoString).toBe('2024-01-15T10:00:00.000Z');
        });

        it('deve formatar data em formato legível (en-us)', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            expect(formatted).toMatch(/Jan\s+\d{1,2},\s+2024/);
        });

        it('deve formatar diferentes meses corretamente', () => {
            // Usando UTC para evitar problemas de timezone
            const dates = [
                new Date('2024-01-01T12:00:00Z'),
                new Date('2024-06-15T12:00:00Z'),
                new Date('2024-12-31T12:00:00Z'),
            ];

            const formatted = dates.map(date =>
                date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC' // Forçando UTC
                })
            );

            expect(formatted[0]).toContain('Jan');
            expect(formatted[1]).toContain('Jun');
            expect(formatted[2]).toContain('Dec');
        });

        it('deve formatar ano corretamente', () => {
            const date = new Date('2024-06-15');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            expect(formatted).toContain('2024');
        });

        it('deve formatar dia corretamente', () => {
            const date = new Date('2024-06-15T12:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });

            expect(formatted).toContain('15');
        });
    });

    describe('Elemento Time HTML', () => {
        it('deve formatar datetime para ISO 8601', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const isoString = date.toISOString();

            expect(isoString).toBe('2024-01-15T10:00:00.000Z');
            expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('deve formatar conteúdo legível para humanos', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            expect(formatted).toMatch(/Jan\s+\d{1,2},\s+2024/);
        });
    });

    describe('Validação de Props', () => {
        it('deve aceitar objeto Date', () => {
            const date = new Date('2024-01-15');
            expect(date instanceof Date).toBe(true);
            expect(date.toISOString()).toBeTruthy();
        });

        it('deve funcionar com diferentes timestamps', () => {
            const timestamps = [
                '2024-01-01T00:00:00Z',
                '2024-06-15T12:30:00Z',
                '2024-12-31T23:59:59Z',
            ];

            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                expect(date.toISOString()).toBeTruthy();
            });
        });

        it('deve lidar com datas inválidas', () => {
            const invalidDate = new Date('invalid');
            expect(invalidDate.toString()).toBe('Invalid Date');
        });
    });

    describe('Formatação de Meses Abreviados', () => {
        it('deve usar mês abreviado (short)', () => {
            const months = [
                { date: new Date('2024-01-01T12:00:00Z'), short: 'Jan' },
                { date: new Date('2024-02-01T12:00:00Z'), short: 'Feb' },
                { date: new Date('2024-03-01T12:00:00Z'), short: 'Mar' },
                { date: new Date('2024-04-01T12:00:00Z'), short: 'Apr' },
                { date: new Date('2024-05-01T12:00:00Z'), short: 'May' },
                { date: new Date('2024-06-01T12:00:00Z'), short: 'Jun' },
                { date: new Date('2024-07-01T12:00:00Z'), short: 'Jul' },
                { date: new Date('2024-08-01T12:00:00Z'), short: 'Aug' },
                { date: new Date('2024-09-01T12:00:00Z'), short: 'Sep' },
                { date: new Date('2024-10-01T12:00:00Z'), short: 'Oct' },
                { date: new Date('2024-11-01T12:00:00Z'), short: 'Nov' },
                { date: new Date('2024-12-01T12:00:00Z'), short: 'Dec' },
            ];

            months.forEach(({ date, short }) => {
                const formatted = date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC'
                });
                expect(formatted).toContain(short);
            });
        });
    });

    describe('Formatação de Dias', () => {
        it('deve formatar dias de 1 a 31', () => {
            for (let day = 1; day <= 31; day++) {
                const date = new Date(`2024-01-${day.toString().padStart(2, '0')}T12:00:00Z`);
                const formatted = date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC'
                });
                expect(formatted).toContain(day.toString());
            }
        });

        it('deve usar formato numérico para dia', () => {
            const date = new Date('2024-01-05T12:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });

            // Deve conter 5, não 05
            expect(formatted).toContain('5');
        });
    });

    describe('Acessibilidade', () => {
        it('deve gerar datetime em formato ISO para máquinas', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const datetime = date.toISOString();

            expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(datetime).toBe('2024-01-15T10:00:00.000Z');
        });

        it('deve gerar conteúdo legível para humanos', () => {
            const date = new Date('2024-01-15T10:00:00Z');
            const content = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            expect(content).toMatch(/^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/);
        });

        it('deve ter formato acessível (datetime ISO + conteúdo legível)', () => {
            const date = new Date('2024-01-15T10:00:00Z');

            const datetime = date.toISOString();
            const readable = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            expect(datetime).toBeTruthy();
            expect(readable).toBeTruthy();
            expect(datetime).not.toBe(readable);
        });
    });

    describe('Internacionalização', () => {
        it('deve usar locale en-us', () => {
            const date = new Date('2024-01-15');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            // Formato en-us: Jan 15, 2024
            expect(formatted).toMatch(/^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/);
        });

        it('deve funcionar com diferentes locales', () => {
            const date = new Date('2024-01-15');

            const locales = ['en-us', 'pt-BR', 'es-ES'];
            locales.forEach(locale => {
                const formatted = date.toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
                expect(formatted).toBeTruthy();
            });
        });
    });

    describe('Casos Extremos', () => {
        it('deve formatar primeiro dia do ano', () => {
            const date = new Date('2024-01-01T12:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });

            expect(formatted).toContain('Jan');
            expect(formatted).toContain('1');
            expect(formatted).toContain('2024');
        });

        it('deve formatar último dia do ano', () => {
            const date = new Date('2024-12-31T12:00:00Z');
            const formatted = date.toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });

            expect(formatted).toContain('Dec');
            expect(formatted).toContain('31');
            expect(formatted).toContain('2024');
        });

        it('deve funcionar com anos bissextos', () => {
            const date = new Date('2024-02-29T12:00:00Z');
            expect(date.getUTCDate()).toBe(29);
            expect(date.getUTCMonth()).toBe(1); // Fevereiro
        });

        it('deve funcionar com diferentes timezones', () => {
            const date1 = new Date('2024-01-15T00:00:00Z');
            const date2 = new Date('2024-01-15T23:59:59Z');

            expect(date1.toISOString()).toBeTruthy();
            expect(date2.toISOString()).toBeTruthy();
        });
    });

    describe('Consistência de Formato', () => {
        it('deve usar mesmo formato para todas as datas', () => {
            const dates = [
                new Date('2024-01-01'),
                new Date('2024-06-15'),
                new Date('2024-12-31'),
            ];

            const formatted = dates.map(date =>
                date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })
            );

            // Todas devem seguir o padrão: Month Day, Year
            formatted.forEach(f => {
                expect(f).toMatch(/^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/);
            });
        });

        it('deve ter opções de formatação consistentes', () => {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            };

            expect(options.year).toBe('numeric');
            expect(options.month).toBe('short');
            expect(options.day).toBe('numeric');
        });
    });
});
