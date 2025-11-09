#!/usr/bin/env node

/**
 * Script para limpar arquivos de lock e preparar ambiente de desenvolvimento
 * 
 * Remove:
 * - Lock files do Next.js
 * - Cache de build
 * - Processos órfãos (opcional)
 */

import { unlink, access } from 'fs/promises';
import { join } from 'path';

const LOCK_FILES = [
  'apps/web/.next/dev/lock',
  'apps/blog/.astro/lock',
];

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function removeLockFile(path: string): Promise<boolean> {
  const fullPath = join(process.cwd(), path);
  
  if (await fileExists(fullPath)) {
    try {
      await unlink(fullPath);
      console.log(`✓ Removido: ${path}`);
      return true;
    } catch (error) {
      console.error(`✗ Erro ao remover ${path}:`, error);
      return false;
    }
  } else {
    console.log(`- Não existe: ${path}`);
    return false;
  }
}

async function cleanup() {
  console.log('🧹 Limpando ambiente de desenvolvimento...\n');
  
  let removedCount = 0;
  
  for (const lockFile of LOCK_FILES) {
    if (await removeLockFile(lockFile)) {
      removedCount++;
    }
  }
  
  console.log(`\n✅ Limpeza concluída! ${removedCount} arquivo(s) removido(s).`);
  console.log('\n💡 Agora você pode executar:');
  console.log('   pnpm dev       - Para rodar apenas Next.js');
  console.log('   pnpm dev:blog  - Para rodar apenas Astro');
  console.log('   pnpm dev:all   - Para rodar ambos');
}

cleanup().catch(error => {
  console.error('❌ Erro durante limpeza:', error);
  process.exit(1);
});
