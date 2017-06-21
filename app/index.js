const CloudformationPlugin = require('./lib/cloudformation')
const CustomerResourceStore = require('./lib/custom_resource_store')

const handler = (event, context, callback) => {
  let store = new CustomerResourceStore(event, context.logStreamName)

  /* if it's a delete request, don't do anything */
  if (event.RequestType == "Delete") {
      store.sendResponse("SUCCESS")
        .then( res => callback(null, 'success') )
        .catch( err => callback(err) )
      return
  }

  let props = event.ResourceProperties
  let promises = []

  try {
    Object.keys(props).forEach( key => {
      switch(key) {
        case 'Cloudformation':
          let cloudformation = new CloudformationPlugin()
          props[key].forEach( attrs => promises.push(cloudformation.extract(attrs)))
          break;

        case 'ServiceToken':
          // ServiceToken is passed but is not a actionable plugin key
          break;

        default:
          throw new Error(`${key} not supported`)
      }
    })

    Promise.all(promises)
      .then( values => {
        store.sendResponse("SUCCESS", values.reduce( (acc, n) => Object.assign({}, acc, n)))
          .then( res => callback(null, 'success') )
          .catch( err => callback(err) )
      })
      .catch( reason => callback(reason))
  } catch (err) {
    store.sendResponse("FAILED", err)
      .then( res => callback(err) )
      .catch( err => callback(err) )
  }
}

exports.handler = handler
