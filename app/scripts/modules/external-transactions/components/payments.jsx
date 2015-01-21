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

var paymentActions = require('../actions');
var PaymentItem = require('./payment.jsx');

var Collection = require('../collections/payments');
var collection = new Collection();

var PaymentCreateModal = require('./payment-create-modal.jsx');

var Payments = React.createClass({
  mixins: [ActiveState, Router.State],

  getInitialState: function() {

    // TODO - separate the backbone collection from the state and retrieve only its JSON representation
    return {
      payments: collection.toJSON()
    };
  },

  componentDidMount: function() {
    collection.on('sync', this.handleCollectionSync);
    paymentActions.updateUrl(this.getPath());
  },

  componentWillUnmount: function() {
    collection.off('sync');
  },

  // @data payment collection or model
  handleCollectionSync: function(collection, data) {

    // TODO - is there a better way to handle separation of collection vs model syncs?
    if (data instanceof Backbone.Model) {

      // changing a model in the collection/state won't trigger a re-render
      this.forceUpdate();

      return false;
    } else {
      this.setState({
        payments: data.external_transactions
      });
    }
  },

  createTitle: function(transactionType) {
    transactionType = transactionType || 'Deposits';

    var titleMap = {
      deposits: 'Deposits',
      withdrawals: 'Withdrawals'
    };

    return titleMap[transactionType];
  },

  transactionTypeMap: {
    deposits: true,
    withdrawals: false
  },

  // tertiary nav config: transactionType => path to link to => anchor label
  navigationInfo: {
    deposits: {
      all: 'All',
      invoice: 'Invoice',
      queued: 'Queued',
      processed: 'Processed',
      failed: 'Failed'
    },
    withdrawals: {
      all: 'All',
      invoice: 'Invoice',
      queued: 'Queued',
      succeeded: 'Succeeded',
      failed: 'Failed'
    }
  },

  buildNavigation: function(navigationInfo, transactionType) {
    var _this = this;
    var links = _.map(navigationInfo[transactionType], function(linkLabel, transactionState) {
      var activeStateClass = '';
      var params = {
        transactionType: transactionType,
        state: transactionState
      };

      if (_this.isActive('transactions', transactionState)) {
        activeClass = 'active';
      }

      return (
        <Link key={_.uniqueId()} to='transactions' params={params} className={activeStateClass}>
          {linkLabel}
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
    var _this = this,
        transactionType = this.getParams().transactionType,
        state = this.getParams().state,
        tertiaryNav;

    // less than ideal, will refactor when we have pagination, if not sooner.
    // We could keep different collections for each type, but it depends on use case.
    var paymentItems = _.chain(this.state.payments)
      .filter(function(model) {
        return model.deposit === _this.transactionTypeMap[transactionType];
      })
      .filter(function(model) {
        return state === 'all'? true : model.status === state;
      })
      .map(function(model) {
        return (
          <PaymentItem
            key={model.id}
            model={model}
          />
        );
    }, this);

    tertiaryNav = this.buildNavigation(this.navigationInfo, transactionType);

    return (
      <DocumentTitle title={this.createTitle(transactionType)}>
        <div>
          <div className="row">
            <div className="col-sm-12 col-xs-12">
              <h1>Transactions:
                <span className="header-links">
                  <Link
                    to='transactions'
                    params={{transactionType: 'withdrawals', state: 'all'}}
                    className={this.isActive('transactions', {transactionType: 'withdrawals'}) ? 'active' : ''}
                  >
                    Ripple to Bank
                  </Link>
                  <Link
                    to='transactions'
                    params={{transactionType: 'deposits', state: 'all'}}
                    className={this.isActive('transactions', {transactionType: 'deposits'}) ? 'active' : ''}
                  >
                    Bank to Ripple
                  </Link>
                  <ModalTrigger modal={
                    <PaymentCreateModal
                      title={"Record Transaction"}
                      formType={"newPayment"}
                      submitActions={[paymentActions.sendPaymentAttempt]}
                    />
                  }>
                    <a>Record Transaction</a>
                  </ModalTrigger>
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
