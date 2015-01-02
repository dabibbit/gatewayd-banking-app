"use strict";

var _ = require('lodash');
var url = require('url');
var Backbone= require('backbone');

var React = require('react');
var DocumentTitle = require('react-document-title');

// React Router
var Router = require('react-router');
var ActiveState = require('react-router').ActiveState;
var Link = require('react-router').Link;


// React Bootstrap
var ModalTrigger = require('react-bootstrap').ModalTrigger;

var accountActions = require('../actions.js');
var AccountItem = require('./account.jsx');

var Collection = require('../collections/accounts.js');
var collection = new Collection();

var AccountCreateFormModel = require('../models/account-create.js');
var accountCreateFormModel = new AccountCreateFormModel();
var AccountCreateForm = require('./account-create.jsx');


var Accounts = React.createClass({
  mixins: [ActiveState, Router.State],

  getInitialState: function() {

    // TODO - separate the backbone collection from the state and retrieve only its JSON representation
    return {
      accounts: collection
    };
  },

  componentDidMount: function() {
    collection.on('sync', this.handleCollectionSync);
    accountActions.updateUrl(this.getPath());
  },

  componentWillUnmount: function() {
    collection.off('sync');
  },

  // @data payment collection or model
  handleCollectionSync: function(data) {

    // TODO - is there a better way to handle separation of collection vs model syncs?
    if (data instanceof Backbone.Model) {

      // changing a model in the collection/state won't trigger a re-render
      this.forceUpdate();

      return false;
    } else {
      this.setState({
        accounts: data
      });
    }
  },

  createTitle: function(accountType) {
    accountType = accountType || 'Accounts';

    var titleMap = {
      customer: 'Customer Accounts',
      gateway: 'Gateway Accounts'
    };

    return titleMap[accountType];
  },

  render: function() {
    var _this = this,
        accountType = this.getParams().accountType;

    // less than ideal, will refactor when we have pagination, if not sooner.
    // We could keep different collections for each type, but it depends on use case.
    var paymentItems = this.state.accounts.chain()
      .filter(function(model) {
        return accountType === 'all' || model.get('type') === accountType;
      })
      .map(function(model) {
        return (
          <AccountItem
            key={model.get('id')}
            model={model}
          />
        );
    }, this);

    return (
      <DocumentTitle title={this.createTitle(accountType)}>
        <div>
          <div className="row">
            <div className="col-sm-12 col-xs-12">
              <h1>Accounts:
                <span className="header-links">
                  <Link to='accounts' params={{accountType: 'all'}}>
                    All
                  </Link>
                  <Link to='accounts' params={{accountType: 'gateway'}}>
                    Gateway
                  </Link>
                  <Link to='accounts' params={{accountType: 'customer'}}>
                    Customer
                  </Link>
                  <ModalTrigger modal={<AccountCreateForm model={accountCreateFormModel} />}>
                    <a>Create</a>
                  </ModalTrigger>
                </span>
              </h1>
            </div>
          </div>
          <div className="row">
            <ul className="list-group">
              {paymentItems}
            </ul>
          </div>
        </div>
      </DocumentTitle>
    );
  }
});

module.exports = Accounts;
