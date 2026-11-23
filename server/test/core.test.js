import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../src/middleware/auth.js';
import { askOpenRouter } from '../src/services/openrouter.js';

const originalKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;
const originalFetch = globalThis.fetch;

afterEach(() => {
  if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
  else process.env.OPENROUTER_MODEL = originalModel;
  globalThis.fetch = originalFetch;
});

function responseMock() {
  return {
    code: 200,
    body: null,
    clearedCookie: false,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    clearCookie() { this.clearedCookie = true; }
  };
}

test('auth middleware rejects a request without a token', () => {
  process.env.JWT_SECRET = 'unit-test-jwt-secret-that-is-long-enough';
  const req = { headers: {}, cookies: {} };
  const res = responseMock();
  let nextCalled = false;

  requireAuth(req, res, () => { nextCalled = true; });

  assert.equal(res.code, 401);
  assert.equal(nextCalled, false);
});

test('auth middleware accepts a valid HttpOnly-cookie JWT', () => {
  process.env.JWT_SECRET = 'unit-test-jwt-secret-that-is-long-enough';
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET, { expiresIn: '1m' });
  const req = { headers: {}, cookies: { support_token: token } };
  const res = responseMock();
  let nextCalled = false;

  requireAuth(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.userId, '507f1f77bcf86cd799439011');
});

test('auth middleware clears an invalid cookie and rejects the request', () => {
  process.env.JWT_SECRET = 'unit-test-jwt-secret-that-is-long-enough';
  const req = { headers: {}, cookies: { support_token: 'not-a-valid-jwt' } };
  const res = responseMock();

  requireAuth(req, res, () => assert.fail('next must not be called'));

  assert.equal(res.code, 401);
  assert.equal(res.clearedCookie, true);
});

test('OpenRouter service fails clearly when its API key is missing', async () => {
  delete process.env.OPENROUTER_API_KEY;
  await assert.rejects(
    askOpenRouter([{ role: 'user', content: 'hello' }]),
    error => error.status === 503 && /OpenRouter API key/.test(error.message)
  );
});

test('OpenRouter service returns the model response and sends the configured model', async () => {
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  process.env.OPENROUTER_MODEL = 'openai/gpt-4o-mini';
  let requestBody;

  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Hello from the test model.' } }] })
    };
  };

  const answer = await askOpenRouter([{ role: 'user', content: 'hello' }]);

  assert.equal(answer, 'Hello from the test model.');
  assert.equal(requestBody.model, 'openai/gpt-4o-mini');
  assert.equal(requestBody.messages.at(-1).content, 'hello');
});

test('OpenRouter service surfaces provider failures as safe errors', async () => {
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: { message: 'Invalid test key.' } })
  });

  await assert.rejects(
    askOpenRouter([{ role: 'user', content: 'hello' }]),
    error => error.status === 502 && error.message === 'Invalid test key.'
  );
});

test('OpenRouter service rejects empty model responses', async () => {
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '  ' } }] })
  });

  await assert.rejects(
    askOpenRouter([{ role: 'user', content: 'hello' }]),
    error => error.status === 502 && /empty answer/i.test(error.message)
  );
});
