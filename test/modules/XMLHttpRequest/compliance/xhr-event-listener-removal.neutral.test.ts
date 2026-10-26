// @vitest-environment happy-dom
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest'
import { waitForXMLHttpRequest } from '#/test/setup/helpers-neutral'
import { getTestServer } from '#/test/setup/vitest'

const server = getTestServer()
const interceptor = new XMLHttpRequestInterceptor()

beforeAll(() => {
  interceptor.apply()
})

afterEach(() => {
  interceptor.removeAllListeners()
})

afterAll(() => {
  interceptor.dispose()
})

it('does not call a removed listener for a mocked response', async () => {
  interceptor.on('request', ({ controller }) => {
    controller.respondWith(new Response('hello world'))
  })

  const loadListener = vi.fn()
  const request = new XMLHttpRequest()
  request.addEventListener('load', loadListener)
  request.removeEventListener('load', loadListener)
  request.open('GET', server.http.url('/resource'))
  request.send(null)

  await waitForXMLHttpRequest(request)

  expect(loadListener).not.toHaveBeenCalled()
})
