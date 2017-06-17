const AWS = require('aws-sdk')
let cloudformation

class CloudformationPlugin {
  constructor() {
    this.cloudformation = new AWS.CloudFormation()
  }

  filterOutputs(list, mask) {
    return list.map( o => {
      if (mask.indexOf(o.OutputKey) > -1)
        return { [o.OutputKey]: o.OutputValue }
    }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
  }

  filterResources(list, mask) {
    return list.map( r => {
      if (mask.indexOf(r.LogicalResourceId) > -1)
        return { [r.LogicalResourceId]: r.PhysicalResourceId }
    }).reduce( (acc, newVal) => Object.assign({}, acc, newVal))
  }

  extractResources(stack, resources) {
    return this.cloudformation.describeStackResources({ StackName: stack }).promise()
      .then( response => this.filterResources(response.StackResources, resources) )
  }

  extractOutputs(stack, outputs) {
    return this.cloudformation.describeStacks({ StackName: stack }).promise()
      .then( response => response.Stacks[0].Outputs ? this.filterOutputs(response.Stacks[0].Outputs, outputs) : {} )
  }

  extract(stack, attributes) {
    return new Promise( (resolve, reject ) => {
      try {
        let operations = []
        operations.push(attributes.Outputs ? this.extractOutputs(stack, attributes.Outputs) : {})
        operations.push(attributes.Resources ? this.extractResources(stack, attributes.Resources) : {})

        let promises = Promise.all(operations)
          .then( values => resolve({ Outputs: values[0], Resources: values[1] }))
          .catch( reason => reject(reason))
      } catch(err) {
        reject(err)
      }
    })
  }
}

module.exports = CloudformationPlugin
