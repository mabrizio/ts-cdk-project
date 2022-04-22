# Welcome to your CDK TypeScript project

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Misc stuff

### Database password

The DB database admin password is generated randomly when my stack is created, and its stored in Secrets Manager. This is the command needed to pull the authentication details:

```bash
$ aws secretsmanager get-secret-value --secret-id my-secrt-name | jq ".SecretString | fromjson"
```

This is the output:

```json
{
  "password": "******************",
  "dbname": "growthdaysdb",
  "engine": "postgres",
  "port": 5432,
  "dbInstanceIdentifier": "td1uug3cdeo8rop",
  "host": "td1uug3cdeo8rop.cxevoxw57dj4.us-east-1.rds.amazonaws.com",
  "username": "pgadmin"
}

```