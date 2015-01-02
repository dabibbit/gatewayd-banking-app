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
      payments: collection
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
  handleCollectionSync: function(data) {

    // TODO - is there a better way to handle separation of collection vs model syncs?
    if (data instanceof Backbone.Model) {

      // changing a model in the collection/state won't trigger a re-render
      this.forceUpdate();

      return false;
    } else {
      this.setState({
        payments: data
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

  render: function() {
    var _this = this,
        transactionType = this.getParams().transactionType,
        state = this.getParams().state,
        tertiaryNav;

    // less than ideal, will refactor when we have pagination, if not sooner.
    // We could keep different collections for each type, but it depends on use case.
    var paymentItems = this.state.payments.chain()
      .filter(function(model) {
        return model.get('deposit') === _this.transactionTypeMap[transactionType];
      })
      .filter(function(model) {
        return state === 'all'? true : model.get('status') === state;
      })
      .map(function(model) {
        return (
          <PaymentItem
            key={model.get('id')}
            model={model}
          />
        );
    }, this);

    //todo make separate component with iterator. Oy.
    if (transactionType === 'deposits') {
      tertiaryNav = (
        <div className="nav-tertiary">
          <Link to='transactions' params={{transactionType: 'deposits', state: 'all'}}>All</Link>
          <Link to='transactions' params={{transactionType: 'deposits', state: 'invoice'}}>Invoice</Link>
          <Link to='transactions' params={{transactionType: 'deposits', state: 'queued'}}>Queued</Link>
          <Link to='transactions' params={{transactionType: 'deposits', state: 'cleared'}}>Cleared</Link>
          <Link to='transactions' params={{transactionType: 'deposits', state: 'failed'}}>Failed</Link>
        </div>);
    } else {
      tertiaryNav = (
        <div className="nav-tertiary">
          <Link to='transactions' params={{transactionType: 'withdrawals', state: 'all'}}>All</Link>
          <Link to='transactions' params={{transactionType: 'withdrawals', state: 'invoice'}}>Invoice</Link>
          <Link to='transactions' params={{transactionType: 'withdrawals', state: 'queued'}}>Queued</Link>
          <Link to='transactions' params={{transactionType: 'withdrawals', state: 'cleared'}}>Cleared</Link>
          <Link to='transactions' params={{transactionType: 'withdrawals', state: 'failed'}}>Failed</Link>
        </div>);
    }

    return (
      <DocumentTitle title={this.createTitle(transactionType)}>
        <div>
          <div className="row">
            <div className="col-sm-12 col-xs-12">
              <h1>Transactions:
                <span className="header-links">
                  <Link to='transactions' params={{transactionType: 'withdrawals', state: 'all'}}>
                    Ripple to Bank
                  </Link>
                  <Link to='transactions' params={{transactionType: 'deposits', state: 'all'}}>
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
