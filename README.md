# Unburn It

An audiovisual art project.

## Development

```
unburn-it
└─── infrastructure # CDK setup for defining the infrastructure
└─── main           # Main project
└─── placeholder    # Placeholder site
```

### Main project

- install dependencies with `npm install`
- start app in development mode with `npm start` (the development server responds at http://localhost:9000)
- lint code with `npm run lint`

Babylon.js Inspector can be enabled by adding `inspector=true` query parameter to the url.

### Placeholder site

- install dependencies with `npm install`
- start app in development mode with `npm start` (the development server responds at http://localhost:9000)

## Hosting & deployment

The project is hosted as a static site in Amazon S3. Current CDK setup allows creating the required infrastructure and defines two environments: development and production.

### Prerequisites:

- [AWS CLI](https://aws.amazon.com/cli/) with default credentials and region configured
- [AWS CDK](https://aws.amazon.com/cdk/)
- Registered domain in [Amazon Route 53](https://aws.amazon.com/route53/)
- Initialize CDK in _infrastructure_ directory with `cdk bootstrap`

### Deployment:

NPM deployment scripts can be run in both _main_ and _placeholder_ directories.

- Deploy to dev (https://dev.unburn.it) with `npm run deploy:dev`
- Deploy to prod (https://unburn.it) with `npm run deploy:prod`
