const CloudformationPlugin = require('./lib/cloudformation')
const CustomerResourceStore = require('./lib/custom_resource_store')

const handler = (event, context, callback) => {
  let store = new CustomerResourceStore(event, context.logStreamName)

  /* if it's a delete request, don't do anything */
  if (event.RequestType === "Delete") {
      return store.sendResponse("SUCCESS")
        .then( res => callback(null, 'success') )
        .catch( err => callback(err) )
  }

  let props = event.ResourceProperties

  try {
    switch(props.Type) {
      case 'Cloudformation':
        let cloudformation = new CloudformationPlugin()
        cloudformation.extract(props)
          .then( res => {
            store.sendResponse("SUCCESS", res)
              .then( res => callback(null, 'success'))
              .catch( err => callback(err))
          })
          .catch( reason => callback(reason))
        break;

      default:
        throw new Error(`${key} not supported`)
    }
  } catch(exception) {
    store.sendResponse("FAILED", exception)
      .then( res => callback(exception) )
      .catch( err => callback(`${exception}\n${err}`) )
  }
}

exports.handler = handler
