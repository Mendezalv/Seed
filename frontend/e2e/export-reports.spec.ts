import { test, expect } from '@playwright/test';

test.describe('Exportação de Relatórios Executivos (PDF e Excel)', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticação prévia em modo demonstração
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
  });

  test('deve abrir o menu de exportação no Dashboard e apresentar opções PDF e XLSX', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /Exportar Relatório/i });
    await expect(exportBtn).toBeVisible();

    // Clica para abrir o dropdown
    await exportBtn.click();

    // Opções devem estar visíveis no dropdown
    const btnPdf = page.getByRole('button', { name: /Relatório Oficial \(PDF\)/i });
    const btnXlsx = page.getByRole('button', { name: /Planilha Gerencial \(\.XLSX\)/i });

    await expect(btnPdf).toBeVisible();
    await expect(btnXlsx).toBeVisible();

    // Fecha ao clicar novamente no botão Exportar Relatório
    await exportBtn.click();
    await expect(btnPdf).not.toBeVisible();
  });

  test('deve abrir o menu de exportação de DRE na página de Viabilidade Econômica', async ({ page }) => {
    // Navega para a página de Viabilidade
    await page.getByRole('link', { name: /Viabilidade/i }).click();
    await expect(page.getByRole('heading', { name: /Viabilidade Econômica & Comercialização/i })).toBeVisible();

    // Botão Exportar DRE deve estar visível
    const exportDreBtn = page.getByRole('button', { name: /Exportar DRE/i });
    await expect(exportDreBtn).toBeVisible();

    // Clica para abrir o dropdown
    await exportDreBtn.click();

    // Opções devem estar visíveis
    const btnPdf = page.getByRole('button', { name: /Laudo Técnico DRE \(PDF\)/i });
    const btnXlsx = page.getByRole('button', { name: /Planilha Contábil \(\.XLSX\)/i });

    await expect(btnPdf).toBeVisible();
    await expect(btnXlsx).toBeVisible();

    // Fecha ao clicar novamente no botão Exportar DRE
    await exportDreBtn.click();
    await expect(btnPdf).not.toBeVisible();
  });
});
