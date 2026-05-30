import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';

const DEFAULT_JK_URL_PREFIX = 'https://japanknowledge.com/lib/display/?lid=';

const jkUrlPrefixAtom = atomWithStorage<string>(
  'nk-gaiji-checker-jk-lid-prefix',
  DEFAULT_JK_URL_PREFIX,
);

const recentPrefixesAtom = atomWithStorage<string[]>(
  'nk-gaiji-checker-recent-prefixes',
  [
    
  ],
);

const isUrlModalOpenAtom = atom(false);
const draftPrefixAtom = atom('');

export {jkUrlPrefixAtom, recentPrefixesAtom, isUrlModalOpenAtom, draftPrefixAtom, DEFAULT_JK_URL_PREFIX};
