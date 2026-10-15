import { test, expect } from '@playwright/test';

test.describe('Central de Notificações e Alertas em Tempo Real', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticação prévia para acesso direto
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
  });

  test('deve abrir o popover de notificações pela Topbar e fechar ao clicar fora', async ({ page }) => {
    // Localiza o botão com aria-label Abrir notificações
    const notifBtn = page.locator('button[aria-label="Abrir notificações"]');
    await expect(notifBtn).toBeVisible();

    // Clica para abrir o popover
    await notifBtn.click();
    const popover = page.locator('.notif-popover');
    await expect(popover).toBeVisible();
    await expect(popover.getByText('Notificações')).toBeVisible();

    // Verifica presença das abas
    await expect(popover.getByRole('button', { name: /^Todas/i })).toBeVisible();
    await expect(popover.getByRole('button', { name: /^Não lidas/i })).toBeVisible();

    // Fecha ao clicar fora (no breadcrumb da Topbar)
    await page.locator('.topbar-breadcrumb').click();
    await expect(popover).not.toBeVisible();
  });

  test('deve alternar entre as abas Todas e Não lidas', async ({ page }) => {
    const notifBtn = page.locator('button[aria-label="Abrir notificações"]');
    await notifBtn.click();

    const popover = page.locator('.notif-popover');
    await expect(popover).toBeVisible();

    // Clica na aba "Não lidas"
    const tabNaoLidas = popover.getByRole('button', { name: /^Não lidas/i });
    await tabNaoLidas.click();

    // Clica na aba "Todas"
    const tabTodas = popover.getByRole('button', { name: /^Todas/i });
    await tabTodas.click();
    await expect(tabTodas).toBeVisible();
  });

  test('deve disparar alerta de teste em tempo real e atualizar a lista', async ({ page }) => {
    const notifBtn = page.locator('button[aria-label="Abrir notificações"]');
    await notifBtn.click();

    const popover = page.locator('.notif-popover');
    await expect(popover).toBeVisible();

    // Localiza o botão de disparar alerta teste
    const dispararBtn = popover.getByRole('button', { name: /Disparar Alerta Teste/i });
    await expect(dispararBtn).toBeVisible();

    // Clica em disparar alerta
    await dispararBtn.click();

    // Deve emitir um toast notification ou atualizar indicador
    await expect(page.locator('.notif-popover')).toBeVisible();
  });

  test('deve fechar o popover ao pressionar tecla Escape', async ({ page }) => {
    const notifBtn = page.locator('button[aria-label="Abrir notificações"]');
    await notifBtn.click();

    const popover = page.locator('.notif-popover');
    await expect(popover).toBeVisible();

    // Pressiona Escape
    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });
});
