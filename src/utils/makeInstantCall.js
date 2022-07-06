export const makeInstantCall = async (call, params, options = {}) => {
  try {
    const resp = await call(params);

    return resp;
  } catch (err) {
    if (options.onError) {
      options.onError(err);
    }

    return null;
  }
};
