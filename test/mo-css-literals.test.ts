import { describe, expect, it } from 'vitest';
import { aliasCss } from '../src/components/mo';

describe('mo-* CSS aliases preserve literal content', () => {
  it.each([
    ['usa-tab[data-copy="usa-tab"]{color:red}', 'mo-tab[data-copy="usa-tab"]{color:red}'],
    ["[data-copy='usa-tab'] usa-tab{color:red}", "[data-copy='usa-tab'] mo-tab{color:red}"],
    ['[data-copy=usa-tab] usa-tab{color:red}', '[data-copy=usa-tab] mo-tab{color:red}'],
    ['[data-copy="};usa-tab{"] usa-tab{color:red}', '[data-copy="};usa-tab{"] mo-tab{color:red}'],
    ['/* usa-tab { example } */ usa-tab{color:red}', '/* usa-tab { example } */ mo-tab{color:red}'],
    ['usa-tab::before{content:";usa-tab{literal}"}usa-tabs{color:red}', 'mo-tab::before{content:";usa-tab{literal}"}mo-tabs{color:red}'],
    [String.raw`usa-tab::before{content:"\";usa-tab{literal}"}`, String.raw`mo-tab::before{content:"\";usa-tab{literal}"}`],
    ['.usa-tab,#usa-tab,.other\\:usa-tab usa-tabs{--usa-x:1;animation:usa-spin 1s}', '.usa-tab,#usa-tab,.other\\:usa-tab mo-tabs{--usa-x:1;animation:usa-spin 1s}'],
    ['/* heading */@media(min-width:1px){usa-tabs:is(usa-tab,[data-copy="usa-tab"]){color:red}}', '/* heading */@media(min-width:1px){mo-tabs:is(mo-tab,[data-copy="usa-tab"]){color:red}}'],
    ['@supports selector(usa-tabs){usa-tab{color:red}}@keyframes usa-spin{to{opacity:1}}', '@supports selector(usa-tabs){mo-tab{color:red}}@keyframes usa-spin{to{opacity:1}}'],
    ['./* comment */usa-tab usa-tabs{color:red}', './* comment */usa-tab mo-tabs{color:red}'],
  ])('converts selectors without changing literals: %s', (input, expected) => {
    expect(aliasCss(input)).toBe(expected);
    expect(aliasCss(expected)).toBe(expected);
  });

  it('keeps an attribute-qualified rule matching the original value in the DOM', () => {
    const style = document.createElement('style');
    style.textContent = aliasCss('usa-css-fixture[data-kind="usa-tab"]{color:rgb(12,34,56)}');
    const element = document.createElement('mo-css-fixture');
    element.setAttribute('data-kind', 'usa-tab');
    document.head.append(style);
    document.body.append(element);
    try {
      expect(getComputedStyle(element).color).toBe('rgb(12, 34, 56)');
    } finally {
      element.remove();
      style.remove();
    }
  });
});
