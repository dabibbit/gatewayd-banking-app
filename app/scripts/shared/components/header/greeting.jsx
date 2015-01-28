"use strict";

var _ = require('lodash');
var React = require('react');
var Link = require('react-router').Link;

var Greeting = React.createClass({
  propTypes: {
    greetingClassName: React.PropTypes.string,
    isLoggedIn: React.PropTypes.bool,
    userName: React.PropTypes.string
  },

  getDefaultProps: function() {
    var defaults = {
      greetingClassName: 'greeting-wrapper',
      isLoggedIn: false,
      userName: ''
    };

    return  defaults;
  },

  handleLoggedIn: function() {
    return (
      <div className="greeting">
        <span className="welcome">
          Welcome {this.props.userName}
        </span>
        <Link to="/logout" className="link">
          Logout
        </Link>
      </div>
    );
  },

  handleLoggedOut: function() {
    return false;
  },

  displayGreeting: function(loginState) {
    var loginStateMap = {
      true: this.handleLoggedIn,
      false: this.handleLoggedOut
    };

    if (!_.isUndefined(loginStateMap[loginState])) {
      return loginStateMap[loginState]();
    } else {
      return false;
    }
  },

  render: function() {
    return (
      <div className={this.props.greetingClassName}>
        {this.displayGreeting(this.props.isLoggedIn)}
      </div>
    );
  }
});

module.exports = Greeting;
