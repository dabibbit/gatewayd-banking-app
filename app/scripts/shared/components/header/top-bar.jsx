"use strict";

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var Branding = require('./branding.jsx');
var NavLinks = require('./nav-links.jsx');
var Greeting = require('./greeting.jsx');
var session = require('../../../modules/session/models/session');

var TopBar = React.createClass({

  mixins: [IntlMixin],

  getDefaultProps: function() {
    return {
      brandName: 'Hello World',
      wrapperClassName: 'navbar',
      isLoggedIn: false,
      userName: ''
    };
  },

  propTypes: {
    links: React.PropTypes.array,
    brandName: React.PropTypes.string,
    wrapperClassName: React.PropTypes.string,
    isLoggedIn: React.PropTypes.bool,
    userName: React.PropTypes.string
  },

  handleExpand: function(e) {
    e.preventDefault();
    this.props.expandSidebar();
  },

  render: function() {
    var nav;

    if (this.props.links.length) {
      nav = (
        <NavLinks
          links={this.props.links}
          navLinksClassName="nav navbar-nav navbar-right"
        />
      );
    }

    return (
      <div className={this.props.wrapperClassName}>
        <a href="#" onClick={this.handleExpand} className="button-sidebar">
          <span className="glyphicon glyphicon-align-justify" aria-hidden="true"></span>
        </a>
        <Branding
          brandName={this.props.brandName}
          wrapperClassName={this.props.brandingClassName}
        />
        <Greeting
          greetingClassName={"greeting-wrapper"}
          isLoggedIn={this.props.isLoggedIn}
          userName={this.props.userName}
        />
        {session.isLoggedIn() ? nav : false}
      </div>
    );
  }
});

module.exports = TopBar;
