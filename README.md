# Unburn It

- install dependencies with `npm install`
- start app in development mode with `npm start` (the development server responds at http://localhost:9000)
- lint code with `npm run lint`
- create a production build with `npm run build`

## Hosting & deployment

The project is hosted as a static site in Amazon S3.

### Prerequisites:

- [AWS CLI](https://aws.amazon.com/cli/) with default credentials and region configured
- [AWS CDK](https://aws.amazon.com/cdk/)
- Registered domain in [Amazon Route 53](https://aws.amazon.com/route53/)

### Deployment:

- Initialize CDK with `cdk bootstrap` (needs to be done only once)
- Deploy with `cdk deploy`
