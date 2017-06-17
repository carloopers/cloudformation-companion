const AWS             = require('aws-sdk-mock')
const cloudformation  = require('lib/cloudformation')

describe('CloudformationPlugin', () => {
  let plugin

  describe('filterOutputs', () => {
    beforeAll( () => plugin = new cloudformation())
    it('should only return outputs present in the mask', () => {
      let mask = [ 'Output1', 'Output2', 'Output3' ]
      let ret = { 'Output1': 'Value1', 'Output3': 'Value3' }
      let listToFilter = [
        { OutputKey: 'Output1', OutputValue: 'Value1' },
        { OutputKey: 'Output4', OutputValue: 'Value4' },
        { OutputKey: 'Output3', OutputValue: 'Value3' }
      ]

      expect(plugin.filterOutputs(listToFilter, mask)).toEqual(ret)
    })
  })

  describe('filterResources', () => {
    it('should only return resources present in the mask', () => {
      let mask = [ 'log1', 'log2', 'log3' ]
      let ret = { 'log1': 'phys1', 'log3': 'phys3' }
      let listToFilter = [
        { LogicalResourceId: 'log1', PhysicalResourceId: 'phys1' },
        { LogicalResourceId: 'log4', PhysicalResourceId: 'phys4' },
        { LogicalResourceId: 'log3', PhysicalResourceId: 'phys3' }
      ]

      expect(plugin.filterResources(listToFilter, mask)).toEqual(ret)
    })
  })

  describe('extractOutputs', () => {
    it('should call filterOutputs with list of outputs and the mask', (done) => {
      let stack = 'test'
      let mask = [ 'key1', 'key2', 'key3' ]

      let paramTest = { Outputs: [ { OutputKey: 'key1', OutputValue: 'val1' } ] }
      let describeStacks = Promise.resolve({
        Stacks: [  paramTest ]
      })

      AWS.mock('CloudFormation', 'describeStacks', describeStacks)
      plugin = new cloudformation()
      plugin.filterOutputs = jest.fn()

      plugin.extractOutputs(stack, mask).then( res => {
        expect(plugin.filterOutputs).toBeCalledWith(paramTest.Outputs, mask)
        plugin.filterOutputs.mockClear()
        done()
      })
    })
  })

  describe('extractResources', () => {
    it('should call filterResources with list of resources and the mask', (done) => {
      let stack = 'test'
      let mask = [ 'key1', 'key2', 'key3' ]
      let paramTest = { StackResources: [ { LogicalResourceId: 'log1', PhysicalResourceId: 'phys1' } ] }
      let describeStackResources = Promise.resolve(paramTest)

      AWS.mock('CloudFormation', 'describeStackResources', describeStackResources)
      plugin = new cloudformation()
      plugin.filterResources = jest.fn()

      plugin.extractResources(stack, mask).then( res => {
        expect(plugin.filterResources).toBeCalledWith(paramTest.StackResources, mask)
        plugin.filterResources.mockClear()
        done()
      })
    })
  })
})
