import expect from 'expect';
import localizationSource from '../i18n/localizations.json';

describe('Localization test', () => {
  it('should contain at least one localization module', () => {
    const allLanguageModules = Object.keys(localizationSource.modules);

    expect(allLanguageModules.length).toBeGreaterThan(0);
  });

  it('should contain the same keys in all localization modules.', () => {
    const allLanguageKeys = Object.keys(localizationSource.modules);
    const expectedKeys = Object.keys(localizationSource.modules[allLanguageKeys[0]]);

    // Each localization, ex. "ru", "en".
    allLanguageKeys.forEach(languageKey => {
      const localization = localizationSource.modules[languageKey];

      expectedKeys.forEach(key => {
        expect(localization).toHaveProperty([key]);
      });
    });
  });

  it('should not contain empty values in all localization modules.', () => {
    const allLanguageKeys = Object.keys(localizationSource.modules);
    const expectedKeys = Object.keys(localizationSource.modules[allLanguageKeys[0]]);

    // Each localization, ex. "ru", "en".
    allLanguageKeys.forEach(languageKey => {
      const localization = localizationSource.modules[languageKey];

      expectedKeys.forEach(key => {
        expect(localization[key]).toBeTruthy();
      });
    });
  });
});
