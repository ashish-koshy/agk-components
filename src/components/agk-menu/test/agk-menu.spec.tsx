import { newSpecPage } from '@stencil/core/testing';
import { AgkMenu } from '../agk-menu';

describe('agk-menu', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AgkMenu],
      html: `<agk-menu></agk-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <agk-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </agk-menu>
    `);
  });
});
