import { RequestScheduler } from './request-scheduler';

export async function readBoundedBody(request: Request, maxBytes = 15 * 1024 * 1024, signal?: AbortSignal): Promise<ArrayBuffer | undefined> {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const abort = () => { void reader.cancel().catch(() => {}); };
  if (signal?.aborted) { await reader.cancel(); reader.releaseLock(); throw new Error('REQUEST_TIMEOUT'); }
  signal?.addEventListener('abort', abort, { once: true });
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (signal?.aborted) throw new Error('REQUEST_TIMEOUT');
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new Error('PAYLOAD_TOO_LARGE'); }
      chunks.push(value);
    }
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return body.buffer;
  } finally { signal?.removeEventListener('abort', abort); reader.releaseLock(); }
}

export interface ForwardBodyOptions {
  signal?: AbortSignal;
  idleTimeoutMs?: number;
}

function isStreamAbortOrTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: string; code?: string; message?: string; cause?: unknown };
  const name = err.name || '';
  const msg = (err.message || '').toLowerCase();
  if (name === 'AbortError' || name === 'TimeoutError' || err.code === 'ABORT_ERR' || err.code === 'UND_ERR_ABORTED') {
    return true;
  }
  if (msg.includes('aborted') || msg.includes('terminated') || msg.includes('premature close')) {
    return true;
  }
  return err.cause ? isStreamAbortOrTimeoutError(err.cause) : false;
}

// Preserve backpressure and release the admission slot only when the body ends.
export function forwardBody(
  body: ReadableStream<Uint8Array> | null,
  done: () => void,
  options?: ForwardBodyOptions
): ReadableStream<Uint8Array> | null {
  if (!body) { done(); return null; }
  if (options?.signal?.aborted) {
    void body.cancel().catch(() => {});
    done();
    return null;
  }
  const reader = body.getReader();
  let closed = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let abortedOrTimedOut = false;

  const clearIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const onAbort = () => {
    abortedOrTimedOut = true;
    clearIdleTimer();
    void reader.cancel().catch(() => {});
  };

  const finish = () => {
    clearIdleTimer();
    options?.signal?.removeEventListener('abort', onAbort);
    if (!closed) {
      closed = true;
      try { reader.releaseLock(); } catch {}
      done();
    }
  };

  options?.signal?.addEventListener('abort', onAbort, { once: true });

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (options?.signal?.aborted) {
          abortedOrTimedOut = true;
          try { controller.close(); } catch {}
          finish();
          return;
        }
        if (options?.idleTimeoutMs && options.idleTimeoutMs > 0) {
          idleTimer = setTimeout(() => {
            abortedOrTimedOut = true;
            void reader.cancel().catch(() => {});
          }, options.idleTimeoutMs);
        }
        const item = await reader.read();
        clearIdleTimer();
        if (item.done) {
          try { controller.close(); } catch {}
          finish();
        } else {
          controller.enqueue(item.value);
        }
      } catch (error) {
        clearIdleTimer();
        if (abortedOrTimedOut || options?.signal?.aborted || isStreamAbortOrTimeoutError(error)) {
          try { controller.close(); } catch {}
          finish();
        } else {
          controller.error(error);
          finish();
        }
      }
    },
    async cancel(reason) {
      clearIdleTimer();
      try { await reader.cancel(reason); } finally { finish(); }
    }
  });
}

const scheduler = new RequestScheduler();
export function admitProxyRequest(heavy: boolean, signal?: AbortSignal): Promise<() => void> {
  return scheduler.acquire(heavy, signal);
}

// Stream uploads directly to the backend; retain only the current chunk.
export function streamRequestBody(request: Request, maxBytes: number, signal: AbortSignal): ReadableStream<Uint8Array> | undefined {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  let total = 0, closed = false;
  const finish = () => { if (!closed) { closed = true; signal.removeEventListener('abort', abort); reader.releaseLock(); } };
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) abort();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const item = await reader.read();
        if (signal.aborted) throw new Error('REQUEST_TIMEOUT');
        if (item.done) { controller.close(); finish(); return; }
        total += item.value.byteLength;
        if (total > maxBytes) { await reader.cancel(); throw new Error('PAYLOAD_TOO_LARGE'); }
        controller.enqueue(item.value);
      } catch (error) { controller.error(error); finish(); }
    },
    async cancel(reason) { try { await reader.cancel(reason); } finally { finish(); } }
  });
}
