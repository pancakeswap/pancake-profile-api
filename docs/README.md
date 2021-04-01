# Documentation

Base endpoint: [profile.pancakeswap.com/api](https://profile.pancakeswap.com/api)

All endpoints supports [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

# Misc

## 1. Version

> Return the current API version (used to ensure deployment).

Usage :

```
$ curl -X GET https://profile.pancakeswap.com/api/version
```

Response :

```
{
    "version": "1.0.0"
}
```

# Users

# 1. Users

### GET /users/{address}

> Return user information, and leaderboard statistics about latest trading competition.

Usage :

```
$ curl -X GET https://profile.pancakeswap.com/api/users/0x000000000000000000000000000000000000dEaD
```

Response :

```
{
    "adress": <string>,
    "username": <string>,
    "leaderboard": {
        "global": <integer>,
        "team": <integer>,
        "volume": <float>
    },
    "created_at": "2021-01-01T00:00:00.000Z",
    "updated_at": null
}
```

# 2. Register

### POST /users/register

> Create a user, with an address and username, both confirmed by signature request.

Usage :

```
$ curl -X POST -d '{"address": "0x...", "username": "Chef...", "signature": "0x..."}' https://profile.pancakeswap.com/api/users/register
```

Response :

```
{
    "adress": <string>,
    "username": <string>,
    "created_at": "2021-01-01T00:00:00.000Z",
    "updated_at": null
}
```

# 3. Valid

### GET /users/valid/{username}

> Return username validity, based on multiple criteria.

Usage :

```
$ curl -X GET https://profile.pancakeswap.com/api/users/valid/ChefPancake
```

Response :

```
-- Success
{
    "username": <string>,
    "valid": <boolean>
}

-- Failure
{
    "error": {
        "message": <string>
    }
}
```

# Leaderboard

## 1. Global

### GET /leaderboard/global

> Return global leaderboard, ordered by rank (-> volume in USD).

Usage :

```
$ curl -X GET https://profile.pancakeswap.com/api/leaderboard/global
```

Response :

```
{
    "total": 12345,
    "data": [
        {
            "rank": <integer>,
            "adress": <string>,
            "username": <string>,
            "volume": <integer>
        },
        ...
    ]
}
```

## 2. Team

### GET /leaderboard/team/{id}

> Return team leaderboard, per team ID, ordered by rank (-> volume in USD).

Usage :

```
$ curl -X GET https://profile.pancakeswap.com/api/leaderboard/team/1
```

Response :

```
{
    "total": 12345,
    "data": [
        {
            "rank": <integer>,
            "adress": <string>,
            "username": <string>,
            "volume": <integer>
        },
        ...
    ]
}
```
