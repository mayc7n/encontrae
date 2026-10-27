import { expect, test } from '@playwright/test';

test('morador encontra serviço, salva e mantém favorito ao reabrir', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Seu bairro.')).toBeVisible();
  await page.getByRole('button', { name: 'Explorar serviços' }).click();
  await page.getByPlaceholder('Buscar serviço ou assunto').fill('saude');
  await page.getByRole('button', { name: 'Ver serviço Encontre sua unidade de saúde' }).click();
  await page.getByRole('button', { name: 'Salvar nos favoritos' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Acessar serviço oficial' })).toBeVisible();
});

test('troca de cidade persiste e exemplos não permitem candidatura', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Escolher cidade' }).click();
  await page.getByRole('button', { name: 'Curitiba', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Escolher cidade' })).toContainText('Curitiba');
  await page.getByRole('button', { name: 'Explorar vagas' }).click();
  await page.getByRole('button', { name: 'Ver vaga Atendente de loja' }).click();
  await expect(page.getByText('Esta vaga é um exemplo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conversar no WhatsApp' })).toHaveCount(0);
});
