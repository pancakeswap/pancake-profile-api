# PancakeSwap Profile API

Serverless API implementation for PancakeSwap Profile contract

# Dependencies

- [Vercel CLI](https://vercel.com/download)
    - Required to emulate local environment (serverless).

# Documentation

Documentation is available [here](docs/README.md).

# Configuration

# 1. Database

You can configure your database URI for any development purpose by exporting an environment variable.

```shell
# Default: mongodb://localhost:27017/profile
export MONGO_URI = "mongodb://host:port/database";
```

# 2. Blacklist

You can configure (create/update/delete) the blacklist by editing the file located [here](utils/blacklist.json).

> Note: All blacklisted words must be LOWERCASE.

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
# api/version.ts
curl -X GET 'localhost:3000/api/version'

# ...
```

# Production

## Deploy

Deploy to production should be triggered by a webhook when a commit, or a pull-request is merged to `master`.

If you need to force a deployment, use the following command:

```shell
vercel --prod
```
