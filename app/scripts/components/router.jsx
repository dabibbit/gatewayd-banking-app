"use strict";

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

var sessionModel = require('../modules/session/models/session');
var SessionComponent = require('../modules/session/components/session.jsx');
var LoginForm = require('../modules/session/components/login-form.jsx');

// continuously fetch ripple transactions when tab is active
var ExternalTransactions = require('../modules/external-transactions/components/payments.jsx');
var paymentActions = require('../modules/external-transactions/actions.js');
var heartbeats = require('heartbeats');
var pollingHeart = new heartbeats.Heart(1000);

var pollWhenActive = function() {
  if (sessionModel.isLoggedIn()) {
    paymentActions.fetchExternalTransactions();
  }
};

// poll every 5 seconds
pollingHeart.onBeat(5, pollWhenActive);

window.onfocus = function() {
  pollingHeart.clearEvents();
  pollingHeart.onBeat(5, pollWhenActive);
};

window.onblur = function() {
  pollingHeart.onBeat(60 * 5, pollingHeart.clearEvents);
};

var App = require('./app.jsx');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={SessionComponent} />
    <Route name="login" handler={SessionComponent} />
    <Route name="logout" handler={SessionComponent} />
    <Route name="payments" path="payments/:paymentType/:state" handler={ExternalTransactions}/>
    <Route name="notFound" handler={NotFound} />
    <NotFoundRoute handler={NotFound} />
    <Redirect from="/" to="/login" />
  </Route>
);

module.exports = routes;
