"use strict";

var stringLib = require('../i18n/messages');
var React = require('react');
var Router = require('react-router');
var routes = require('./components/router.jsx');

if (!window.Intl) {
  window.Intl = require('intl');
}

Router.run(routes, Handler => {
  React.render(<Handler {...stringLib} locales={['en-US']} />, document.getElementById('content-main'));
});
