"use strict";

var _ = require('lodash');
var moment = require('moment');
var React = require('react');
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var paymentCreateModel = require('../models/payment-create');
var PaymentCreateModalForEditing = require('./payment-create-modal.jsx');
var PaymentDetailContent = require('./payment-detail-content.jsx');
var paymentActions = require('../actions');
var Chevron = require('../../../shared/components/glyphicon/chevron.jsx');
var currencyPrecision = require('../../../shared/currency-precision');
var appConfig = require('../../../../../app-config');

var Payment = React.createClass({
  propTypes: {
    model: React.PropTypes.object
  },

  statusMap: {},

  buildStatusMap: function() {
    var statusMap = {};

    // transactionType === withdrawals or deposits
    _.each(appConfig.status, function(statusCollection, transactionType) {
      statusMap[transactionType] = {};

      _.each(statusCollection, function(statusDetails, statusName) {
        statusMap[transactionType][statusName] = statusDetails.message;
      });
    });

    return statusMap;
  },

  handleDetailIconClick: function(id) {
    this.setState({
      showDetails: !this.state.showDetails
    });
  },

  // showSpinningIcon: function() {
  //   this.setState({
  //     refreshIconClasses: 'glyphicon glyphicon-refresh glyphicon-spin'
  //   });
  // },

  // hideSpinningIcon: function() {
  //   this.setState({
  //     refreshIconClasses: ''
  //   });
  // },

  setDefaults: function(a, b) {
    return (_.isNull(a) || _.isUndefined(a)) ? b : a;
  },

  getInitialState: function() {
    return {
      refreshIconClasses: '',
      showDetails: false
    };
  },

  componentWillMount: function() {
    // this.props.model.on('pollingStart', this.showSpinningIcon);
    // this.props.model.on('pollingStop', this.hideSpinningIcon);
    this.statusMap = this.buildStatusMap();
  },

  componentWillUnmount: function() {
    // this.props.model.off('pollingStart pollingStop');
  },

  render: function() {
    var _this = this;
    var doneButton, refreshIcon, accountName;
    var model = this.props.model;
    var formattedDestinationAmount = currencyPrecision(
      model.destination_currency, model.destination_amount);

    var detailsDefaults = {
      ripple_transaction_id: 'none',
      invoice_id: 'none',
      memos: 'none'
    };

    var formDefaults = {
      invoice_id: null,
      memos: null
    };

    var defaultPaymentDetailModel = _.merge(model || {}, detailsDefaults, this.setDefaults);

    // model.deposit, true === deposits, false === withdrawals
    var typeMap = {
      true: 'deposits',
      false: 'withdrawals'
    };
    var accountNameDirectionMap = {
      true: 'Sender',
      false: 'Receiver'
    };
    var transactionType = typeMap[model.deposit];

    if (transactionType === 'withdrawals' && model.status === appConfig.status.withdrawals.queued.name) {
      doneButton = (
        <ModalTrigger modal={
          <PaymentCreateModalForEditing
            title={"Process Ripple to Bank Queued Transaction"}
            formType={"editPayment"}
            submitActions={[paymentActions.flagAsDoneWithEdits, paymentActions.flagAsFailed]}
            model={_.merge(model, formDefaults)} // converted to form model without invoice id and memos in form
          />
        }>
          <button className="btn pull-right">
            Process
          </button>
        </ModalTrigger>
      );
    } else if (transactionType === 'deposits' && model.status === appConfig.status.deposits.invoice.name) {
      doneButton = (
        <ModalTrigger modal={
          <PaymentCreateModalForEditing
            title={"Execute transfer and confirm final amounts"}
            formType={"editPayment"}
            submitActions={[paymentActions.flagAsInvoicePaid, paymentActions.flagAsFailed]}
            model={_.merge(model, formDefaults)} // converted to form model without invoice id and memos in form
          />
        }>
          <button className="btn pull-right">
            Execute/Confirm Debit
          </button>
        </ModalTrigger>
      );
    } else {
      doneButton = false;
    }

    if (transactionType === 'deposits') {
      accountName = model.fromAccount ? model.fromAccount.name : null;
    } else {
      accountName = model.toAccount ? model.toAccount.name : null;
    }

    return (
      <li className={"payment-item list-group-item animated fade-in modal-container"} ref="container">
        <div className="row">
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Id: </span>
              <span className="data">{model.id} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">{accountNameDirectionMap[model.deposit]}: </span>
              <span className="data">{accountName}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            <p>
              <span className="header">Amount: </span>
              <span className="data">{formattedDestinationAmount} </span>
              <span className="currency">{model.destination_currency}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            <p>
              <span className="header">Status: </span>
              <span className="data">
                {this.statusMap[transactionType][model.status]}
              </span>
              <span className={this.state.refreshIconClasses} />
            </p>
            {doneButton}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-8">
          </div>
          <div className="col-sm-4">
          </div>
        </div>
        <div className="clearfix">
          <span className="date pull-left">
            {moment(model.createdAt).format('MMM D, YYYY HH:mm z')}
          </span>
          <Chevron
            clickHandler={this.handleDetailIconClick.bind(this, model.id)}
            iconClasses="pull-right"
          />
        </div>
        <div>
          {this.state.showDetails ?
            <PaymentDetailContent {...defaultPaymentDetailModel} paymentDetailClassName={"details"}/>
            : false}
        </div>
      </li>
    );
  }
});

module.exports = Payment;
