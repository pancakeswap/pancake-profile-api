# Documentation

Base endpoint: [profile.pancakeswap.com/api](https://profile.pancakeswap.com/api)

All endpoints supports [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

# Miscellaneous

## 1. Version

> Return the current API version.

Usage :

```shell
$ curl -X GET https://profile.pancakeswap.com/api/version
```

Response :

```json5
{
    "version": "1.0.0"
}
```

# Profile

# 1. Users

### GET /users/{address}

> Return user information, and leaderboard statistics about latest trading competition.

Usage :

```shell
$ curl -X GET https://profile.pancakeswap.com/api/users/0x000000000000000000000000000000000000dEaD
```

Response :

```json5
{
    "adress": "<string>",
    "username": "<string>",
    "leaderboard": {
        "global": "<integer>",
        "team": "<integer>",
        "volume": "<float>",
        "next_rank": "<float>"
    },
    "created_at": "<string>",
    "updated_at": "<string|null>"
}
```

### POST /users/register

> Create a user, with an address and username, both confirmed by signature request.

Usage :

```shell
$ curl -X POST -d '{"address": "0x...", "username": "Chef...", "signature": "0x..."}' https://profile.pancakeswap.com/api/users/register
```

Response :

```json5
{
    "adress": "<string>",
    "username": "<string>",
    "created_at": "<string>",
    "updated_at": "<string|null>"
}
```

### GET /users/valid/{username}

> Return username validity, based on multiple criteria.

Usage :

```shell
$ curl -X GET https://profile.pancakeswap.com/api/users/valid/ChefPancake
```

Response :

```json5
{
    "username": "<string>",
    "valid": "<boolean>"
}
```

## 2. Team

### GET /leaderboard/global

> Return leaderboard, ordered by rank (-> volume in USD (desc)).

Usage :

```shell
$ curl -X GET https://profile.pancakeswap.com/api/leaderboard/global
```

Response :

```json5
{
    "total": "<integer>",
    "volume": "<float>",
    "data": [
        {
            "rank": "<integer>",
            "address": "<string>",
            "volume": "<float>",
            "teamId": "<integer>"
        }
    ]
}
```

## 2. Team

### GET /leaderboard/team/{id}

> Return leaderboard, for a given team, ordered by rank (-> volume in USD).

Usage :

```shell
$ curl -X GET https://profile.pancakeswap.com/api/leaderboard/team/1
```

Response :

```json5
{
    "total": "<integer>",
    "volume": "<float>",
    "data": [
        {
            "rank": "<integer>",
            "address": "<string>",
            "volume": "<float>",
            "teamId": "<integer>"
        }
    ]
}
```
