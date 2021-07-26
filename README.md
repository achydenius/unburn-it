# Unburn It

An audiovisual art project.

## Development

- install dependencies with `npm install`
- start app in development mode with `npm start` (the development server responds at http://localhost:9000)
- lint code with `npm run lint`
- create a production build with `npm run build`

Babylon.js Inspector can be enabled by adding `inspector=true` query parameter to the url.

## Hosting & deployment

The project is hosted as a static site in Amazon S3. Current CDK setup allows creating the required infrastructure and defines two environments: development and production.

### Prerequisites:

- [AWS CLI](https://aws.amazon.com/cli/) with default credentials and region configured
- [AWS CDK](https://aws.amazon.com/cdk/)
- Registered domain in [Amazon Route 53](https://aws.amazon.com/route53/)
- Initialize CDK in _infrastructure_ directory with `cdk bootstrap`
- Set `DOMAIN_NAME` environment variable to match the registered domain

### Deployment:

- Deploy to dev (https://dev.DOMAIN_NAME) with `npm run deploy:dev`
- Deploy to prod (https://DOMAIN_NAME) with `npm run deploy:prod`
