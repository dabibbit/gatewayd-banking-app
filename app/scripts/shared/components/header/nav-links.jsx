"use strict";

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

/*
  Sample links array:

  [
    {
      key: "Login"
      href: "/login"
    },
    {
      key: "Main"
      href: "/"
    },
    {
      key: "Logout"
      href: "/logout"
    }
  ]
*/

var NavLinks = React.createClass({

  mixins: [IntlMixin, Router.State],

  propTypes: {
    links: React.PropTypes.array,
    navLinksClassName: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      navLinksClassName: 'nav navbar-nav'
    };
  },

  getFormattedString: function(key) {
    if (!key) {
      return false;
    }

    return <FormattedMessage message={this.getIntlMessage(key)} />;
  },

  getLinks: function(links) {
    var items;

    items = links.map((link, i) => {
      var activeClassState = '';

      if (this.isActive(link.href.split('/')[1])) {
        activeClassState = 'active';
      }

      return (
        <li key={i++}>
          <Link to={link.href} className={activeClassState}>
            {this.getFormattedString(link.key)}
          </Link>
        </li>
      );
    });

    return items;
  },

  render: function() {
    var links = this.getLinks.call(this, this.props.links);

    return (
      <ul className={this.props.navLinksClassName}>
        {links}
      </ul>
    );
  }
});

module.exports = NavLinks;
