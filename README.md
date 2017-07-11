# Cloudformation companion

The Cloudformation companion is a Lambda function to be used as backend to a [CloudFormation custom resource](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html).

Once called the companion will fetch values from different sources according to the input properties passed to the custom resource.

_Note that currently, the only plugin available is Cloudformation._

If you want to know why this project, [scroll below](#why-this-project)!

## How to use

### Requirements

You would first need to create an S3 bucket that will be used to store the lambda function package, used as part of the deployment process.
Of course, you would need to set up your AWS credentials to be able to deploy the cloudformation stack for the companion.

### Deployment of the companion

To deploy the companion, you would need to set a few environments variables if you want to use the script provided:

    export PROJECT="infra" SERVICE="companion" COMPONENT="reader" ARTIFACT_BUCKET="<bucket_you_created>"
    ./deploy/deploy.sh

Feel free to modify the deploy script to fit your needs.

### Usage

Basically, you would need to create a Cloudformation Custom Resource that takes as **SessionToken** the ARN of the lambda function of the **cloudformation-companion** you created in advance.

You can see examples in yaml and json at [template.yaml](example/template.yaml) and [template.json](example/template.json).

#### Properties input

You would pass the configuration of which plugin and which information the companion needs to fetch through the **Properties** of the cloudformation resource.

Each key except the **SessionToken** are the name of the companion plugin that you want to use.

See the [plugins configuration below](#plugins).

#### Attributes from the companion

Once the companion is created, it will have attributes attached that you'll be able to access via `Fn::GetAtt`.

The attributes of the lambda are in the flat structure JSON object.
The reason why attributes are not nested is because `Fn::GetAtt` takes only two elements in its array. It doesn't allow the use of nested attributes (yet?).

The way we went around that, is to compose the key of each attribute with the following format:

    <Outputs|Resources>::<resource_or_output_from_stack>
        eg: Outputs::LoadBalancer


## Plugins

### Using Cloudformation as a source

The cloudformation plugin takes some inputs as properties to know where and to fetch values from, and what values to get.

The attributes it takes are:

    Type: Cloudformation
    StackName: <your_stack>
    Outputs: <array_of_output_key>
    Resources: <array_of_output_key>

## Common Errors

    CustomResource attribute error: Vendor response doesn't contain

This happens if you're using `Fn::GetAtt` on a non-existant or empty attribute on the companion.
You can check all the return attributes in the **Cloudwatch Logs** of the companion.

## Why this project

The reason why this project came about, is because Cloudformation has a limit of 60 parameters.
I have seen templates where the parameters were concatenated to be able to go around the limit, but it's not pretty nor easy to troubleshoot etc.
Also, I'm not a big fan of nested stacks..

Yes, Cloudformation Exports tries to solve the issues of making an output available as an import into another stack, but the export is global to your region..

The companion gives you flexibility.

## Coming soon

  - [ ] Building a Config Service companion for environment configuration

## Contributions

Please send your pull requests and issues through!

## Licence

See [Licence.md](Licence.md) (MIT)
