"use strict";

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var React = require('react');

// React Router
var RouteHandler = require('react-router').RouteHandler;
var DocumentTitle = require('react-document-title');

// session dispatch actions
var sessionActions = require('../modules/session/actions');

// React components
var TopBar = require('../shared/components/header/top-bar.jsx');
var Sidebar = require('../shared/components/sidebar.jsx');
var Wallets = require('../modules/wallets/components/wallets.jsx');

// required to use React Bootstrap in child modules
require('react-bootstrap');

var topBarConfig = {
  brandName: 'Gatewayd Banking App',
  wrapperClassName: 'navbar-inverse navbar-fixed-top top-bar container-fluid',
  links: [
    {
      key: 'topbarNavTransactions',
      href: '/transactions/withdrawals/all'
    },
    {
      key: 'topbarNavAccounts',
      href: '/accounts/all'
    }
  ]
};

var App = React.createClass({

  mixins: [IntlMixin],

  propTypes: {
    isLoggedIn: React.PropTypes.bool,
    userName: React.PropTypes.string,
    loginPath: React.PropTypes.string,
    defaultPath: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      isLoggedIn: false,
      userName: '',
      loginPath: '/',
      defaultPath: '/'
    };
  },

  getInitialState: function() {
    return { showSidebar: false };
  },

  expandSidebar: function() {
    if (this.props.isLoggedIn) {
      this.setState({showSidebar: this.state.showSidebar ? false : true});
    } else {
      this.setState({showSidebar: false});
    }
  },

  render: function() {
    if (!this.props.isLoggedIn) {

      // attempt session restoration
      sessionActions.restore();
    }

    return (
      <div>
        <TopBar
          links={topBarConfig.links}
          brandName={topBarConfig.brandName}
          wrapperClassName={topBarConfig.wrapperClassName}
          expandSidebar={this.expandSidebar}
          userName={this.props.userName}
          isLoggedIn={this.props.isLoggedIn}
        />
        {this.state.showSidebar ?
          <Sidebar sidebarClassName="sidebar sidebar-wallets">
            <Wallets />
          </Sidebar>
          : false
        }
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-12 main">
              <DocumentTitle title={this.getIntlMessage('titleDefault')}>
                <RouteHandler />
              </DocumentTitle>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = App;
