const AWS             = require('aws-sdk-mock')
const cloudformation  = require('lib/cloudformation')

describe('cloudformation', () => {
  describe('filterOutputs', () => {
    it('should only return outputs present in the mask', () => {
      let mask = [ 'Output1', 'Output2', 'Output3' ]
      let ret = { 'Output1': 'Value1', 'Output3': 'Value3' }
      let listToFilter = [
        { OutputKey: 'Output1', OutputValue: 'Value1' },
        { OutputKey: 'Output4', OutputValue: 'Value4' },
        { OutputKey: 'Output3', OutputValue: 'Value3' }
      ]

      expect(cloudformation.filterOutputs(listToFilter, mask)).toEqual(ret)
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

      expect(cloudformation.filterResources(listToFilter, mask)).toEqual(ret)
    })
  })
})
