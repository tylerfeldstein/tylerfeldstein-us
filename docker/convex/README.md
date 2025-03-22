# Self-hosting Convex

By default the Convex backend will store all state in a local SQLite database.
We recommend starting with this basic configuration and then moving the
container to a hosting provider or pointing the backend to a separate SQL
database for a production-ready configuration as needed.

## Docker configuration

First download the
[`docker-compose.yml` file](https://github.com/get-convex/convex-backend/tree/main/self-hosted/docker/docker-compose.yml).
Then, to start the backend and dashboard:

```sh
docker compose up
```

Once the backend is running you can use it to generate admin keys for the
dashboard/CLI:

```sh
docker compose exec backend ./generate_admin_key.sh
```

Visit the dashboard at `http://localhost:6791`. The backend listens on
`http://127.0.0.1:3210`. The backend's http actions are available at
`http://127.0.0.1:3211`.

In your Convex project, add your url and admin key to a `.env.local` file (which
should not be committed to source control):

```sh
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='<your admin key>'
```
