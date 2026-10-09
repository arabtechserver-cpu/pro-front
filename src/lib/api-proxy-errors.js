function isBackendConnectionFailure(error) {
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return false;
  const unreachable = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH']);
  let current = error;
  for (let depth = 0; current && depth < 5; depth++, current = current.cause) {
    if (unreachable.has(current.code)) return true;
  }
  return false;
}

module.exports = { isBackendConnectionFailure };
