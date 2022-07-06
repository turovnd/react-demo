import { loadMessages, devMessages } from '@demo/localization';
import localizations from '../../i18n/localizations.json';

const data = loadMessages(localizations, 'ru');

export const dev = devMessages(data);

export const messages = data['works-ui'];
