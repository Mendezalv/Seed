import { test, expect } from '@playwright/test';

test.describe('Modais Operacionais e Formulários Interativos', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticação prévia para acesso direto
    await page.goto('/login');
    await page.getByRole('button', { name: /Acesso Rápido em Modo Demonstração/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard Executivo/i })).toBeVisible();
  });

  test('deve abrir, cancelar e submeter com sucesso o Modal de Entrada de Insumo', async ({ page }) => {
    // Navega para Insumos
    await page.locator('.sidebar-nav a[href="/insumos"]').click();
    await expect(page.getByRole('heading', { name: /Gestão de Insumos/i })).toBeVisible();

    // Abre o modal pelo botão no cabeçalho
    await page.getByRole('button', { name: /Registrar Entrada de Lote/i }).click();
    const modalBackdrop = page.locator('.modal-backdrop.open');
    await expect(modalBackdrop).toBeVisible();
    await expect(page.getByText('Registrar Entrada de Lote de Insumo')).toBeVisible();

    // Testa fechamento via botão Cancelar
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(modalBackdrop).not.toBeVisible();

    // Reabre o modal para submeter novo lote
    await page.getByRole('button', { name: /Registrar Entrada de Lote/i }).click();
    await expect(modalBackdrop).toBeVisible();

    // Preenche campos do formulário
    const nomeInput = page.locator('input[placeholder*="Clorpirifós"]');
    await nomeInput.fill('Fertilizante Foliar Zinco Extra');

    const fornecedorInput = page.locator('input[placeholder*="Syngenta"]');
    await fornecedorInput.fill('AgroChem Brasil');

    // Confirma entrada
    await page.getByRole('button', { name: /Confirmar Entrada/i }).click();

    // O modal deve fechar e um novo lote / toast deve ser exibido
    await expect(modalBackdrop).not.toBeVisible();
    await expect(page.getByText(/cadastrado com sucesso/i)).toBeVisible();
  });

  test('deve abrir e registrar ocorrência sanitária pelo Dashboard', async ({ page }) => {
    // Clica na ação rápida de registrar ocorrência
    await page.locator('button:has-text("Registrar ocorrência sanitária")').click();

    const modalBackdrop = page.locator('.modal-backdrop.open');
    await expect(modalBackdrop).toBeVisible();
    await expect(page.getByText('Registrar Ocorrência Sanitária em Campo')).toBeVisible();

    // Preenche o agente patogênico
    const agenteInput = page.locator('input[placeholder*="Phakopsora"]');
    await agenteInput.fill('Lagarta das vagens (Spodoptera)');

    // Dispara alerta sanitário
    await page.getByRole('button', { name: /Disparar Alerta Sanitário/i }).click();

    // Modal deve fechar e toast deve ser emitido
    await expect(modalBackdrop).not.toBeVisible();
    await expect(page.getByText(/Alerta emitido: ocorrência/i)).toBeVisible();
  });

  test('deve abrir simulador de viabilidade, ajustar parâmetros e aplicar cenário', async ({ page }) => {
    // Abre pelo botão Simular Cenário no header do Dashboard
    await page.getByRole('button', { name: /Simular Cenário/i }).click();

    const modalBackdrop = page.locator('.modal-backdrop.open');
    await expect(modalBackdrop).toBeVisible();
    await expect(page.getByText('Simulador de Viabilidade Econômica & Margem')).toBeVisible();

    // Altera o preço da saca
    const precoInput = page.locator('.form-group:has-text("Preço Médio da Saca") input');
    await precoInput.fill('145.00');

    // Clica em Aplicar Cenário ao Dashboard
    await page.getByRole('button', { name: /Aplicar Cenário ao Dashboard/i }).click();

    // Modal deve fechar e toast deve ser emitido
    await expect(modalBackdrop).not.toBeVisible();
    await expect(page.getByText(/Simulação concluída/i)).toBeVisible();
  });

  test('deve fechar qualquer modal ao clicar no botão X de fechamento', async ({ page }) => {
    // Abre o simulador
    await page.getByRole('button', { name: /Simular Cenário/i }).click();
    const modalBackdrop = page.locator('.modal-backdrop.open');
    await expect(modalBackdrop).toBeVisible();

    // Clica no botão X
    await page.locator('.modal-close').click();
    await expect(modalBackdrop).not.toBeVisible();
  });
});
