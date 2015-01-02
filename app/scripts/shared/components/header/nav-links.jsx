"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

/*
  Sample links array:

  [
    {
      text: "Login"
      href: "/login"
    },
    {
      text: "Main"
      href: "/"
    },
    {
      text: "Logout"
      href: "/logout"
    }
  ]
*/

var NavLinks = React.createClass({
  mixins: [Router.State],

  propTypes: {
    links: React.PropTypes.array,
    navLinksClassName: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      navLinksClassName: 'nav navbar-nav'
    };
  },

  getLinks: function(links) {
    var _this = this;
    var items;

    items = links.map(function(link, i) {
      var activeClassState = '';

      if (_this.isActive(link.href.split('/')[1])) {
        activeClassState = 'active';
      }

      return (
        <li key={i++}>
          <Link to={link.href} className={activeClassState}>
            {link.text}
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
