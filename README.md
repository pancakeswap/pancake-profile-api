# pancake-profile-api

Serverless API implementation for PancakeSwap Profile smart contract on Binance Smart Chain.

## Dependencies

- [Vercel CLI](https://vercel.com/download)
    - Required to emulate local environment (serverless functions).

# Development

## Install requirements

```shell
yarn global add vercel
```

## Build

```shell
# Install dependencies
yarn

# Build project
vercel dev
```

Endpoints are based on filename inside the `api/` folder.

```shell
# api/time.ts
curl -X GET 'localhost:3000/api/time'

# ...
```

# Production

## Deploy

Deployments to production should be triggered by a webhook when a commit, or a pull-request is merged to `master`.

If you need to force a deployment, use the following command:

```shell
vercel --prod
```
