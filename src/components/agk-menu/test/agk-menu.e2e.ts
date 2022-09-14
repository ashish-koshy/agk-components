import { newE2EPage } from '@stencil/core/testing';

describe('agk-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<agk-menu></agk-menu>');

    const element = await page.find('agk-menu');
    expect(element).toHaveClass('hydrated');
  });
});
