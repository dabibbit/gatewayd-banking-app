"use strict";

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var React = require('react');

// needed for dev tools to work
window.React = React;

// React Router
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Redirect = Router.Redirect;
var NotFound = require('./not-found/not-found.jsx');
var Navigation = require('react-router').Navigation;

var sessionModel = require('../modules/session/models/session');
var SessionComponent = require('../modules/session/components/session.jsx');
var isLoggedIn = false;
var userName = '';

var ExternalAccounts = require('../modules/external-accounts/components/accounts.jsx');

// continuously fetch ripple transactions when tab is active
var ExternalTransactions = require('../modules/external-transactions/components/payments.jsx');
var paymentActions = require('../modules/external-transactions/actions.js');
var heartbeats = require('heartbeats');
var pollingHeart = new heartbeats.Heart(1000);

var pollWhenActive = function() {
  if (isLoggedIn) {
    paymentActions.fetchNewExternalTransactions();
  }
};

// poll every 5 seconds
pollingHeart.onBeat(5, pollWhenActive);

window.onfocus = () => {
  pollingHeart.clearEvents();
  pollingHeart.onBeat(5, pollWhenActive);
};

window.onblur = () => {
  pollingHeart.onBeat(60 * 5, pollingHeart.clearEvents);
};

var App = require('./app.jsx');

var loginPath = '/login';
var logoutPath = '/logout';
var defaultPath = '/transactions/withdrawals/all';

var AppModule = React.createClass({

  mixins: [IntlMixin, Navigation],

  getLogStatus: function(sessionModel) {
    return sessionModel.isLoggedIn();
  },

  getUserName: function(sessionModel) {
    return sessionModel.get('userModel').get('name');
  },

  handleRestore: function(payload) {

    // redirect to login if session restoration failed
    if (payload.success) {
      this.transitionTo(defaultPath);
    } else {
      this.transitionTo(loginPath);
    }

    // occurs before component mounts, so this cannot be set to state
    isLoggedIn = this.getLogStatus(payload.session);
    userName = this.getUserName(payload.session);
  },

  handleLogin: function(sessionModel) {
    this.transitionTo(defaultPath);

    isLoggedIn = this.getLogStatus(sessionModel);
    userName = this.getUserName(sessionModel);
  },

  handleLogout: function(payload) {
    this.transitionTo(loginPath);

    isLoggedIn = this.getLogStatus(payload.session);
  },

  componentWillMount: function() {
    sessionModel.on('attemptRestore', this.handleRestore);
  },

  componentDidMount: function() {
    sessionModel.on('sync', this.handleLogin);
    sessionModel.on('logout', this.handleLogout);

    this.forceUpdate();
  },

  componentWillUnmount: function() {
    sessionModel.off('attemptRestore sync logout');
  },

  render: function() {
    return (
      <App
        loginPath={loginPath}
        defaultPath={defaultPath}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />
    );
  }
});

var SessionComponentModule = React.createClass({
  render: function() {
    return (
      <
        SessionComponent
          loginPath={loginPath}
          logoutPath={logoutPath}
          defaultPath={defaultPath}
      />
    );
  }
});

var ExternalTransactionsModule = React.createClass({
  render: function() {
    return (
      <ExternalTransactions />
    );
  }
});

var ExternalAccountsModule = React.createClass({
  render: function() {
    return (
      <ExternalAccounts />
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={AppModule}>
    <DefaultRoute handler={SessionComponentModule} />
    <Route name="login" handler={SessionComponentModule} />
    <Route name="logout" handler={SessionComponentModule} />
    <Route name="transactions" path="transactions/:transactionType/:state" handler={ExternalTransactionsModule} />
    <Route name="accounts" path="accounts/:accountType" handler={ExternalAccountsModule} />
    <Route name="notFound" handler={NotFound} />
    <NotFoundRoute handler={NotFound} />
    <Redirect from="/" to={loginPath} />
  </Route>
);

module.exports = routes;
