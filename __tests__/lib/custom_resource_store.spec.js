const CustomResourceStore = require('lib/custom_resource_store')
const nock = require('nock')

describe('CustomResourceStore', () => {
  let event = { StackId: 'test', RequestId: '123', LogicalResourceId: 'MyResource', ResponseURL: 'https://url/test'}
  let store
  beforeAll(() => {
    store = new CustomResourceStore(event, 'stream')
  })

  it('should initiate properly', () => {
    expect(store.logStreamName).toBe('stream')
    expect(store.event).toEqual(event)
  })

  it('should make an HTTPS call with the given payload and return', (done) => {
    nock('https://url')
      .put('/test', JSON.stringify({
        Status: "SUCCESS", Data: 'Data',
        Reason: "See the details in CloudWatch Log Stream:  stream",
        PhysicalResourceId: 'stream',
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId
      }))
      .reply(202, {})

    store.sendResponse('SUCCESS', 'Data')
      .then( (res) => done())
  })
})
