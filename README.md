# Accrevo Company API

live demo: https://accrevo-server-gnnvxwamiv.now.sh

## credentials

To properly set up the service, the following credential information is needed:
- **database root password**: this is only used once during the initialization of the database service.
- **web service user/password**: these are used by the web service to access the database service.
- **database name**: the name used for the main database. (optional - defaults to `accrevocompany`)

## database

source directory: [`/db`](https://github.com/blead/accrevo-db/tree/master/db)  
Docker image based on [`mysql:8`](https://hub.docker.com/_/mysql/)   
required: [Docker](https://www.docker.com/)  

Clone the repository:
```
git clone https://github.com/blead/accrevo-db.git
```

Navigate to `/db`:
```
cd accrevo-db/db
```

Build an image:
```
docker build -t {image-name} .
```
- `image-name` can be anything. This is used to run the image on the next step.

Deploy a container:
```
docker run --name {container-name} -e MYSQL_ROOT_PASSWORD={database-root-password} -e MYSQL_USER={web-service-user} -e MYSQL_PASSWORD={web-service-password} -e MYSQL_DATABASE={database-name} -p 3306:3306 -d {image-name}
```
- `container-name` can be anything. This is set for ease of container management. (see [Docker Documentation](https://docs.docker.com/))
- `database-root-password`, `web-service-user`, `web-service-password`, `database-name` are already stated earlier.
- `image-name` must be the same as the one built in the above step.
- _note: `-e MYSQL_DATABASE={database-name}` is optional as stated earlier._

The database service is now running on port 3306.

## web

source directory: [`/server`](https://github.com/blead/accrevo-db/tree/master/server)
required: [Node.js](https://nodejs.org/en/)

Clone the repository: (if already done above, skip this step)
```
git clone https://github.com/blead/accrevo-db.git
```

Navigate to `/server`:
```
cd accrevo-db/server
```
or if the current directory is `/db`:
```
cd ../server
```

Install dependencies
```
npm install
```

Create a new configuration file `config.json`, refer to `config.json.example` for an example.
- `server`:
  - `port`: (integer) the port on which the server runs.
  - `log`:
    - `get`: (boolean) if `true`, the server will log HTTP GET requests.
    - `post`: (boolean) if `true`, the server will log HTTP POST requests.
    - `badRequest`: (boolean) if `true`, the server will log HTTP 400 responses.
    - `accessDenied`: (boolean) if `true`, the server will log HTTP 401 responses.
    - `notFound`: (boolean) if `true`, the server will log HTTP 404 responses.
    - `error`: (boolean) if `true`, the server will log HTTP 500 responses.
- `db`: this object is used as an option for [`node-mysql`](https://github.com/mysqljs/mysql)
  - `connectionLimit`: (integer) number of maximum concurrent connections to the database service
  - `connectTimeout`: (integer, millisecond) maximum response time allowed for a database connection
  - `acquireTimeout`: (integer, millisecond) maximum time allowed for a connection pool acquisition
  - `host`: (string) hostname of the database service
  - `port`: (integer) the port on which the database service runs (3306 if following the steps above)
  - `user`: (string) web service user
  - `password`: (string) web service password
  - `database`: (string) database name 

Start the server
```
npm start
```

The web service is now running on port 80.

## usage

Refer to the [API documentation](http://puu.sh/uX2Xr/73e86e6b5c.pdf).  
Note that some adjustments were made to allow a sensible implementation of the service.  
For the time being, no authentication credentials are validated. Any username/password pair is accepted.  
This implementation uses [`node-uuid`](https://github.com/broofa/node-uuid) to generate [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-compliant API keys (UUIDv4).
