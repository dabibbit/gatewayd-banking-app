# Gatewayd Banking App

[https://gatewayd.org/tools/gatewayd-banking-app](https://gatewayd.org/tools/gatewayd-banking-app)

The gatewayd banking/manual integration app is a proof of concept that consumes gatewayd's endpoints involving external transactions (/v1/external_transactions) and external accounts (/v1/external_accounts).

Features:
- Monitor transactions in real time
- Check transaction details
- Process deposits (sender debits) paying off quoted invoices that move funds from the bank to the Ripple network
- Process withdrawals (receiver credits) paid out to the recipient from funds moved from the Ripple network to the bank
- Create a gateway account and customer accounts
- Display accounts

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

6. Navigate the links to filter between the Transactions and Accounts sections as well as the transaction/account types.

7. Click on a transaction/account to see its details.

8. Click the 'Execute/Confirm Debit' button on any unprocessed transaction (a Sender Debit with 'invoice' status or a Receiver Credit with 'queued' status) to open a form that allows you to confirm the details and clear or fail the transaction.

9. Click the 'Create' link in the Accounts section to open a form for creating accounts. **Please create one 'gateway' account and at least one 'customer' account.**

    Type: 'type' column in external_accounts table with values: 'acct' for customers (the bank's customers), 'gateway' for gateway account (your gateway's designated parking account)

    Name: 'name' column in external_accounts table

    Bank Name: 'data' column in external_accounts table

    Bank Account Number: 'uid' column in external_accounts table

    Federation Address: used for quotes, 'address' column in external_accounts table

10. Payments will be constantly refreshed while gateway app tab/window is active/open.

_* If admin@example.com does not work as the username, check_ **/config/config.json** _or_ **/config/environment.js** _in gatewayd and append admin@ with the value of the DOMAIN property._

## Compatibility With Quoting App

The quoting app requires the gateway's user auth and basic auth to be disabled to allow gateways to freely communicate with each other. To configure everything to allow the banking app to work with the quoting app in tandem, disregard steps 2, 4, and 5 of the **How To Use* section above, set up the banking app locally via steps 1-4 of the **Developers - Getting Started** section below, and perform these steps:

1. Edit each involved gateway's config file:

    ```
    $ vim conifg/config.json
    ```
    Make sure these attributes are set as follows:

    {
        ...

        "SSL": true,
        "USER_AUTH": false,
        "BASIC_AUTH": false,
        "PORT": 5000,
        "DOMAIN": "localhost:5000",

        ...
    }

    PORT and DOMAIN can be changed accordingly (e.g. changing PORT to 5050 and DOMAIN to localhost:5050 on a second gateway).

2. Edit the banking app's app-config.json file to configure from which gatewayd instance you want to monitor (baseUrl) and from which port on localhost you want to access the app from (connectPort). Make sure the banking app's connectPort is different from the quoting app's connectPort.
    ```
    $ vim app-config.json
    ```

## Developers - Getting Started:

1. Clone the app repo from [Github](https://github.com/gatewayd/gatewayd-banking-app):

    ```
    $ git clone git@github.com:gatewayd/gatewayd-banking-app.git
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

4. In your browser, access the local app via the default url:

    ```
    http://localhost:9090
    ```

5. If you are using Chrome, install [Live Reload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) and click the Live Reload icon to activate live reloading when your files are modified and rebuilt.

6. This application uses [React](http://facebook.github.io/react/docs/tutorial.html) views and [Backbone stores](http://www.toptal.com/front-end/simple-data-flow-in-react-applications-using-flux-and-backbone?utm_source=javascriptweekly&utm_medium=email) within the [Flux architecture](http://facebook.github.io/flux/docs/overview.html). [React Router](https://github.com/rackt/react-router) is used for client-side routing. It also has Bootstrap styling supported with [React Bootstrap](http://react-bootstrap.github.io/).

7. There is an app config file at **./app-config.json** that allows you to set up the default host url and username if you want to expedite the login process.

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
