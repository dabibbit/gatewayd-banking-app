"use strict";

var _ = require('lodash');
var url = require('url');
var Backbone= require('backbone');

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var DocumentTitle = require('react-document-title');

// React Router
var Router = require('react-router');
var ActiveState = require('react-router').ActiveState;
var Link = require('react-router').Link;


// React Bootstrap
var paymentActions = require('../actions');
var PaymentItem = require('./payment.jsx');

var Collection = require('../collections/payments');
var collection = new Collection();

var appConfig = require('../../../../../app-config');

var Payments = React.createClass({

  mixins: [IntlMixin, ActiveState, Router.State],

  getInitialState: function() {

    // TODO - separate the backbone collection from the state and retrieve only its JSON representation
    return {
      payments: collection.toJSON()
    };
  },

  componentWillMount: function() {
    this.navigationInfoMap = this.buildNavigationInfoMap();
  },

  componentDidMount: function() {
    collection.on('fetchedTransactions refreshedTransactions sync', this.handleCollectionSync);
    paymentActions.updateUrl(this.getPath());
  },

  componentWillUnmount: function() {
    collection.off('fetchedTransactions refreshedTransactions sync');
  },

  handleCollectionSync: function(collection, data) {
    this.setState({
      payments: collection.toJSON()
    });
  },

  createTitle: function(transactionType) {
    transactionType = transactionType || 'Deposits';

    var titleMap = {
      deposits: 'titleDeposits',
      withdrawals: 'titleWithdrawals'
    };

    return this.getIntlMessage(titleMap[transactionType]);
  },

  transactionTypeMap: {
    deposits: true,
    withdrawals: false
  },

  // tertiary nav config: transactionType => path to link to => anchor label
  navigationInfoMap: {},

  buildNavigationInfoMap: function() {
    var navigationInfoMap = {};

    // transactionType === withdrawals or deposits
    _.each(appConfig.status, (statusCollection, transactionType) => {

      // navigation includes all 'status' to display every transaction of specific type
      navigationInfoMap[transactionType] = {
        all: 'transactionFilterAll'
      };

      _.each(statusCollection, (statusDetails, statusName) => {
        navigationInfoMap[transactionType][statusName] = statusDetails.navTitle;
      });
    });

    return navigationInfoMap;
  },

  buildNavigation: function(navigationInfoMap, transactionType) {
    var links = _.map(navigationInfoMap[transactionType], (linkLabel, transactionState) => {
      var activeClass = '',
          params = {
            transactionType: transactionType,
            state: transactionState
          };

      if (this.isActive('transactions', transactionState)) {
        activeClass = 'active';
      }

      return (
        <Link key={_.uniqueId()} to='transactions' params={params} className={activeClass}>
          <FormattedMessage message={this.getIntlMessage(linkLabel)} />
        </Link>
      );
    });

    return (
      <div className="nav-tertiary">
        {links}
      </div>
    );
  },

  render: function() {
    var transactionType = this.getParams().transactionType,
        state = this.getParams().state,
        tertiaryNav, paymentItems;

    // less than ideal, will refactor when we have pagination, if not sooner.
    // We could keep different collections for each type, but it depends on use case.
    paymentItems = _.chain(this.state.payments)
      .filter(model => {
        return model.deposit === this.transactionTypeMap[transactionType];
      })
      .filter(model => {
        return state === 'all'? true : model.status === state;
      })
      .map(model => {
        return (
          <PaymentItem
            key={model.id}
            model={model}
          />
        );
      }, this);

    tertiaryNav = this.buildNavigation(this.navigationInfoMap, transactionType);

    return (
      <DocumentTitle title={this.createTitle(transactionType)}>
        <div>
          <div className="row">
            <div className="col-sm-12 col-xs-12">
              <h1>
                <span className="header-links">
                  <Link
                    to='transactions'
                    params={{transactionType: 'withdrawals', state: 'all'}}
                    className={this.isActive('transactions', {transactionType: 'withdrawals'}) ? 'active' : ''}
                  >
                    <FormattedMessage message={this.getIntlMessage('transactionNavCredits')} />
                  </Link>
                  <Link
                    to='transactions'
                    params={{transactionType: 'deposits', state: 'all'}}
                    className={this.isActive('transactions', {transactionType: 'deposits'}) ? 'active' : ''}
                  >
                    <FormattedMessage message={this.getIntlMessage('transactionNavDebits')} />
                  </Link>
                </span>
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              {tertiaryNav}
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

module.exports = Payments;
