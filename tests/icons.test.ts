import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { SIcon } from 'sax-design-vue/es/components/icon/index.mjs';
import { getIconData } from 'sax-design-vue-iconify';
import { registerBrandIcon } from '../src/icons/runtime-brand';

describe('shared icon registry and SIcon integration', () => {
  it('renders custom registry data through the component library', async () => {
    registerBrandIcon();
    expect(getIconData('custom:brand-mark')?.attributes.viewBox).toBe('0 0 56 48');
    const html = await renderToString(createSSRApp(() => h(SIcon, { name: 'custom:brand-mark', label: 'Brand' })));
    expect(html).toContain('viewBox="0 0 56 48"');
    expect(html).toContain('M43 9H22');
    expect(html).toContain('aria-label="Brand"');
  });
  it('renders the fallback slot for an unknown name', async () => {
    const html = await renderToString(createSSRApp(() => h(SIcon, { name: 'custom:unknown-for-test' }, { default: () => 'fallback' })));
    expect(html).toContain('fallback');
    expect(html).not.toContain('<svg');
  });
});
