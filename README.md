# twitterproxy

## Design
The application was developed using JavaScript and Node.js 8.9.4. It is based on Express and uses Passport for
authenticating the users with Twitter.

The code is broken down into three files:
- [server.js](./src/server.js): Contains the core of the application. Defines the application's routes and handles
authentication.
- [utils.js](./src/utils.js): Contains helper functions used for authentication.
- [views.js](./src/views.js): Contains HTML strings that are used to build the application's UI.

Initially I attempted to make use of the Oauth protocol to authenticate requests based on the logged in user. For that
reason I used Passport, which is a well known library for authentication in Node.js. After that I attempted to follow
the instructions in the Twitter developer documentation ([Authorizing a request](https://developer.twitter.com/en/docs/basics/authentication/guides/authorizing-a-request),
[Creating a signature](https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature)) in order
to authenticate my requests. Unfortunately, I was not successful. I was getting back the following error:
```json
{"errors":[{"code":215,"message":"Bad Authentication data."}]}
```
and I could not find where the problem was. Also, there was not much detail in the error to show what the problem was.
As such, I decided to use a library ([node-twitter](https://github.com/desmondmorris/node-twitter)) that would handle
authenticating against the Twitter api.

Furthermore, I decided to include a very basic UI that depended on serving HTML strings and no styling in order to save
time. The get tweets endpoint responds with a raw JSON file. As such, if you view it directly in a browser, without a
JSON viewer plugin, it will not be very human readable.

One thing to note is that because of the problems I had with OAuth the application right now only creates tweets to my
own [account](https://twitter.com/Firkraag144)

## Possible Improvements
The first improvement I would implement would be to finish the implementation of the OAuth client. That way I would be
able to use tokens received from logged in users and not just create tweets in my own account. Also, I would look into
using Redis and/or a database to keep user and session information. Currently, user and session info is stored in memory.
Afterwards I would look into improving the UI to something more than a bare bones HTML page. Lastly, I would look into
what other functionality the twitter api provides and try to integrate it too.

## Deployment
The solution is currently deployed to Heroku at http://twit-proxy.herokuapp.com/. If you want to execute it locally you
should follow the following steps:
- Set the following environment variables:
    - `PORT`: The port number the server should listen for connections.
    - `HOST`: The current hostname of the server. Used for the OAuth redirect.
    - `NODE_ENV`: A string denoting the environment the server is running, e.g. 'development' or 'production'
    - `CONSUMER_KEY`: A twitter client application's consumer key.
    - `CONSUMER_SECRET`: A twitter client application's consumer secret.
    - `ACCESS_TOKEN`: A twitter registered developer's access token.
    - `ACCESS_SECRET`: A twitter registered developer's access secret.
- Install dependencies: `npm install`
- Start the server: `npm start`

## Scaling
The application could be scaled by adding more docker containers and a load balancer that would direct the load to
each container. The containers do not have to be on separate machines. Since node.js is single-threaded we could have a
cluster running on the same multi-core physical machine. Furthermore, as mentioned before, I should add some king of
persistent session storage that would allow all containers to verify sessions from the same set. Right now each node
would be able to verify only the sessions it has in its own memory. 
