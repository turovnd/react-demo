import { useEffect, useState } from 'react';

/**
 * The hook called only on deep change in dependencies.
 *
 * @param {Function} callback The callback function.
 * @param {*} dependencies The array to deep equality test.
 */
export const useDeepEffect = (callback, dependencies = []) => {
  const [prevSearch, setPrevSearch] = useState({ ...dependencies });

  useEffect(() => {
    const currSearch = { ...dependencies };
    const currJson = JSON.stringify(currSearch);

    if (prevSearch !== currJson) {
      setPrevSearch(currJson);

      callback();
    }
  }, dependencies);
};
