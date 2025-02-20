# OfficeGame
A multiplayer shooting game set in an office environment.

## Getting started
Follow the steps below to set up the project for the first time. After completing the setup, check the [Development](#development) section for instructions on running the project.

### Installation
#### 1. Setup large file storage
* Install Git LFS from the [git-lfs.com](https://git-lfs.com).
* Run `git lfs install` to configure LFS extension in your local environment.
#### 2. Install dependencies
#### JavaScript
Run the following command to install the required dependencies:
```sh
npm ci
```
#### Python
Set up a virtual environment and install the necessary packages:
```sh
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

#### 3. Initialize the database
Apply migrations to set up the database tables:
```sh
python dev/manage.py migrate
```

#### 4. Create a default user
Create an admin user to log in to the system. Replace `<name>` with an appropriate value:
```sh
DJANGO_SUPERUSER_PASSWORD="IndeformPass" python dev/manage.py createsuperuser --no-input --username <name> --email <name>@local.dev.com
```

### Development
#### Start development servers
1. Start the Webpack bundler to compile front-end assets and watch for changes:
    ```sh
    npm run watch
    ```
2. Start the Django development server:
    ```sh
    python dev/manage.py runserver
    ```
    To run the server with a debugger ([debugpy](https://github.com/microsoft/debugpy)) support:
    ```
    python -Xfrozen_modules=off -m debugpy --listen localhost:5678 dev/manage.py runserver
    ```
