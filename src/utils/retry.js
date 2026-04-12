/**
 * Exponential backoff helper.
 * Not used by BullMQ directly (BullMQ handles its own backoff),
 * but useful for one-off retry needs within services.
 *
 * @param {Function} fn - Async function to retry
 * @param {object}   opts
 * @param {number}   opts.attempts - Max attempts (default 3)
 * @param {number}   opts.delay    - Initial delay in ms (default 500)
 * @returns {Promise<any>}
 */
async function withRetry(fn, { attempts = 3, delay = 500 } = {}) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const wait = delay * Math.pow(2, i); // 500, 1000, 2000 …
      await new Promise((res) => setTimeout(res, wait));
    }
  }

  throw lastError;
}

module.exports = { withRetry };
