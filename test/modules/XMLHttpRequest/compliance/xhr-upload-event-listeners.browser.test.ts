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

it('does not call a removed upload listener for a mocked response', async () => {
  interceptor.on('request', ({ controller }) => {
    controller.respondWith(new Response('hello world'))
  })

  const progressListener = vi.fn()
  const request = new XMLHttpRequest()
  request.upload.addEventListener('progress', progressListener)
  request.upload.removeEventListener('progress', progressListener)
  request.open('POST', server.http.url('/resource'))
  request.send('hello world')

  await waitForXMLHttpRequest(request)

  expect(progressListener).not.toHaveBeenCalled()
})

it('dispatches an event to the upload listeners', () => {
  const progressListener = vi.fn()
  const request = new XMLHttpRequest()
  request.upload.addEventListener('progress', progressListener)
  request.upload.dispatchEvent(
    new ProgressEvent('progress', {
      lengthComputable: true,
      loaded: 5,
      total: 10,
    })
  )

  expect(progressListener).toHaveBeenCalledOnce()
})

it('calls only the current upload event handler for a mocked response', async () => {
  interceptor.on('request', ({ controller }) => {
    controller.respondWith(new Response('hello world'))
  })

  const firstHandler = vi.fn()
  const secondHandler = vi.fn()
  const request = new XMLHttpRequest()
  request.upload.onprogress = firstHandler
  request.upload.onprogress = secondHandler
  request.open('POST', server.http.url('/resource'))
  request.send('hello world')

  await waitForXMLHttpRequest(request)

  expect(firstHandler).not.toHaveBeenCalled()
  expect(secondHandler).toHaveBeenCalled()
})
