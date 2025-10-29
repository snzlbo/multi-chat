# Astro Starter Kit: Basics

| Command                           | Action                                      |
| :-------------------------------- | :------------------------------------------ |
| `yarn install`                    | Installs dependencies                       |
| `cp configs/dev.example.env .env` | Copy env file and replace env variables     |
| `yarn dev`                        | Starts local dev server at `localhost:4321` |
| `yarn build`                      | Build your production site to `./dist/`     |

# For deployment build

| Command                                        | Action                                                    |
| :--------------------------------------------- | :-------------------------------------------------------- |
| `cp configs/dev.example.env configs/dev.env`   | Copy dev.env and replace necessary environment variables  |
| `cp configs/prod.example.env configs/prod.env` | Copy prod.env and replace necessary environment variables |
| `bash deploy.sh -e dev`                        | Build static site for dev deployment                      |
| `bash deploy.sh -e prod`                       | Build static site for prod deployment                     |
