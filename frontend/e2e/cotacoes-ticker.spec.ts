import { test, expect } from '@playwright/test';

test.describe('Cotações de Commodities e Simulação de Pregão em Tempo Real', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticação prévia em modo demonstração
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
  });

  test('deve renderizar o ticker de cotações dinâmico na Topbar', async ({ page }) => {
    const ticker = page.locator('.ticker-bar');
    await expect(ticker).toBeVisible();

    // Deve conter os códigos das commodities
    await expect(ticker.getByText('SOJA:')).toBeVisible();
    await expect(ticker.getByText('MILHO:')).toBeVisible();
    await expect(ticker.getByText('BOI:')).toBeVisible();
  });

  test('deve abrir o modal de cotações detalhadas ao clicar no ticker e simular flutuação de pregão', async ({ page }) => {
    const ticker = page.locator('.ticker-bar');
    await ticker.click();

    // Modal deve abrir
    const modal = page.locator('.modal-card:has-text("Pregão de Commodities & Câmbio em Tempo Real")');
    await expect(modal).toBeVisible();

    // Verifica presença de commodities no grid
    await expect(modal.getByText('Soja Paranaguá')).toBeVisible();
    await expect(modal.getByText('Milho Campinas')).toBeVisible();
    await expect(modal.getByText('Boi Gordo SP')).toBeVisible();
    await expect(modal.getByText('Dólar Comercial')).toBeVisible();

    // Clica no botão de simular pregão
    const simularBtn = modal.getByRole('button', { name: /Simular Variação de Pregão/i });
    await expect(simularBtn).toBeVisible();
    await simularBtn.click();

    // Fecha o modal pelo botão Fechar do rodapé
    await modal.locator('.modal-footer button.btn-primary').click();
    await expect(modal).not.toBeVisible();
  });
});
