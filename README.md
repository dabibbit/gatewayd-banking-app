# Gatewayd Basic App

[http://gatewayd.org/tools/basic](http://gatewayd.org/tools/basic)

The gatewayd basic admin webapp allows administrators to log in to their gateway remotely.

Features:
- Monitor incoming/outgoing ripple transactions in real time
- Check transaction details
- Clear incoming transactions before they're processed
- Send payments (issue currency) to a ripple address or ripple name

## How To Use:

1. [Start up your gateway](https://ripple.com/build/gatewayd/#gatewayd-usage).
2. To get your API key, in the terminal:

    ```
    $ bin/gateway get_key
    ```
3. Visit the gateway's host url in the browser to trust and accept the security authorization.

    ```
    "Advanced" => "Proceed anyway"
    ```
4. Visit the [gatewayd basic admin webapp](http://gatewayd.org/tools/basic).

5. Enter your gatewayd host url, username (*admin@example.com* by default*), and API key.

6. Navigate the links to filter between transaction types.

7. Click on a 'Ripple Graph Link' within the payments list to see a graphical representation of the transaction.

8. Click on a transaction to see its details.

9. Click the 'Send Payment' link to open a form for sending payments.
10. Payments will be constantly refreshed while gateway app tab/window is active/open.

_* If admin@example.com does not work as the username, check_ **/config/config.json** _or_ **/config/environment.js** _in gatewayd and append admin@ with the value of the DOMAIN property._

## Developers - Getting Started:

1. Clone the webapp repo from [Github](https://github.com/gatewayd/gatewayd-basic-app):

    ```
    $ git clone git@github.com:gatewayd/gatewayd-basic-app.git
    ```
2. Navigate to the cloned directory and install its dependencies:

    ```
    $ npm install
    $ bower install
    ```
3. Run the gulp build process/live reload server:

    ```
    npm run dev
    ```
    If you get an EMFILE error, you need to increase the maximum number of files than can be opened and processes that can be used:

    ```
    $ ulimit -n 1000
    $ ulimit -u 1000
    ```
4. In your browser, access the local webapp via the default url:

    ```
    http://localhost:8080
    ```
5. If you are using Chrome, install [Live Reload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) and click the Live Reload icon to activate live reloading when your files are modified and rebuilt.

6. This application uses [React](http://facebook.github.io/react/docs/tutorial.html) views and [Backbone stores](http://www.toptal.com/front-end/simple-data-flow-in-react-applications-using-flux-and-backbone?utm_source=javascriptweekly&utm_medium=email) within the [Flux architecture](http://facebook.github.io/flux/docs/overview.html). [React Router](https://github.com/rackt/react-router) is used for client-side routing. It also has Bootstrap styling supported with [React Bootstrap](http://react-bootstrap.github.io/).
7. There is an app config file at **/app/scripts/shared/app-config.js** that allows you to set up the default host url and username if you want to expedite the login process.

8. You can find the root of the of app at:

    ```
    /app/scripts/main.jsx
    ```
9. BETA FEATURE - USE WITH CAUTION:
Added to the gulpfile are new deploy scripts. These are for convenience
and have little or no safety checks. It is easy to overwrite your server
using this! Its use requires a secrets.json file at the root of your
project to be configured:
```
{
"userName": "myUserName",
"hostName": "myHostName",
"passPhrase": "some string which is your passphrase"
}
```

This can be reconfigured for your particular use. Please remember to
never commit or share your private information.

"npm run deploy" and "npm run rollback" are the possible commands.
