import { test, expect } from '@playwright/test';

test.describe('Autenticação e Navegação pelas Telas do Ecossistema', () => {
  test('deve redirecionar usuário não autenticado para /login ao tentar acessar rota protegida', async ({ page }) => {
    // Limpa qualquer dado salvo no storage
    await page.goto('/talhoes');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Acesso à Plataforma/i })).toBeVisible();
  });

  test('deve realizar login pelo formulário e redirecionar para o dashboard', async ({ page }) => {
    await page.goto('/login');

    // Preenche credenciais
    const emailInput = page.locator('input[type="email"]');
    const senhaInput = page.locator('input[type="password"]');

    await emailInput.fill('admin@seed.com');
    await senhaInput.fill('SenhaForte123!');

    // Clica no botão de acesso rápido demo
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();

    // Deve estar no Dashboard
    await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:5173\/?$/);
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
    await expect(page.locator('.sidebar-brand')).toBeVisible();
  });

  test('deve navegar com sucesso por todas as 8 telas através da Sidebar', async ({ page }) => {
    // Autentica via login demo
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();

    // 1. Talhões & GIS
    await page.locator('.sidebar-nav a[href="/talhoes"]').click();
    await expect(page).toHaveURL(/.*\/talhoes/);
    await expect(page.getByRole('heading', { name: /Gestão Territorial & Talhões/i })).toBeVisible();

    // 2. Ciclo de Safras
    await page.locator('.sidebar-nav a[href="/safras"]').click();
    await expect(page).toHaveURL(/.*\/safras/);
    await expect(page.getByRole('heading', { name: /Ciclo de Safras & Planejamento Produtivo/i })).toBeVisible();

    // 3. Insumos & Lotes
    await page.locator('.sidebar-nav a[href="/insumos"]').click();
    await expect(page).toHaveURL(/.*\/insumos/);
    await expect(page.getByRole('heading', { name: /Gestão de Insumos & Rastreabilidade de Lotes/i })).toBeVisible();

    // 4. Maquinários
    await page.locator('.sidebar-nav a[href="/maquinarios"]').click();
    await expect(page).toHaveURL(/.*\/maquinarios/);
    await expect(page.getByRole('heading', { name: /Gestão de Maquinários & Frotas/i })).toBeVisible();

    // 5. Viabilidade Econômica
    await page.locator('.sidebar-nav a[href="/viabilidade"]').click();
    await expect(page).toHaveURL(/.*\/viabilidade/);
    await expect(page.getByRole('heading', { name: /Viabilidade Econômica & Comercialização/i })).toBeVisible();

    // 6. Vigilância Sanitária
    await page.locator('.sidebar-nav a[href="/vigilancia"]').click();
    await expect(page).toHaveURL(/.*\/vigilancia/);
    await expect(page.getByRole('heading', { name: /Vigilância Sanitária & Monitoramento Epidemiológico/i })).toBeVisible();

    // 7. Energia & ESG
    await page.locator('.sidebar-nav a[href="/energia-esg"]').click();
    await expect(page).toHaveURL(/.*\/energia-esg/);
    await expect(page.getByRole('heading', { name: /Sustentabilidade, Energia & ESG/i })).toBeVisible();

    // 8. Retorno ao Dashboard
    await page.locator('.sidebar-nav a[href="/"]').first().click();
    await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:5173\/?$/);
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
  });

  test('deve efetuar logout e retornar à tela de login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();

    // Clica no botão de logout no rodapé da Sidebar
    const logoutBtn = page.locator('.sidebar-footer button[title="Sair"]');
    await logoutBtn.click();

    // Deve voltar para a tela de login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Acesso à Plataforma/i })).toBeVisible();
  });
});
