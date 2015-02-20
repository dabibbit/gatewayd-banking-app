"use strict";

var stringLib = require('../../../../i18n/messages');
var _ = require('lodash');
var moment = require('moment');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var paymentCreateModel = require('../models/payment-create');
var PaymentEditModal = require('./payment-create-modal.jsx');
var PaymentDetailContent = require('./payment-detail-content.jsx');
var paymentActions = require('../actions');
var Chevron = require('../../../shared/components/glyphicon/chevron.jsx');
var currencyPrecision = require('../../../shared/currency-precision');
var appConfig = require('../../../../../app-config');

var Payment = React.createClass({

  mixins: [IntlMixin],

  propTypes: {
    model: React.PropTypes.object
  },

  statusMap: {},

  //todo: move this to a parse in the store
  buildStatusMap: function() {
    var statusMap = {};

    // transactionType === withdrawals or deposits
    _.each(appConfig.status, (statusCollection, transactionType) => {
      statusMap[transactionType] = {};

      _.each(statusCollection, (statusDetails, statusName) => {
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

  setDefaults: function(a, b) {
    return (_.isNull(a) || _.isUndefined(a)) ? b : a;
  },

  getInitialState: function() {
    return {
      showDetails: false
    };
  },

  componentWillMount: function() {
    this.statusMap = this.buildStatusMap();
  },

  getDirectionHeader: function(isDeposit) {
    var key = isDeposit ? 'transactionSender' : 'transactionReceiver';

    return <FormattedMessage message={this.getIntlMessage(key)}/>;
  },

  getDoneButton: function(model) {
    var button = false,
        submitActions = [paymentActions.flagAsFailed],
        titleKey = '';

    //only display if deposit && invoice, OR
    //!deposit and queued
    if (model.deposit && model.status === 'invoice') {
      button = true;
      titleKey = "transactionDoneButtonTitle2";
      submitActions.unshift(paymentActions.flagAsInvoicePaid);
    } else if (!model.deposit && model.status === 'queued') {
      button = true;
      submitActions.unshift(paymentActions.flagAsDoneWithEdits);
      titleKey = "transactionDoneButtonTitle1";
    }

    return button ? (
      <ModalTrigger
        modal={
          <PaymentEditModal
            {...stringLib}
            titleKey={titleKey}
            formType={"editPayment"}
            submitActions={submitActions}
            model={model}
          />
        }>
        <button className="btn pull-right">
          <FormattedMessage
            message={this.getIntlMessage('transactionDoneButtonText')} />
        </button>
      </ModalTrigger>
    ) : false;
  },

  render: function() {
    var model = this.props.model,
        formattedDestinationAmount, detailsDefaults, formDefaults,
        defaultPaymentDetailModel, defaultPaymentFormModel, accountName;

    formattedDestinationAmount = currencyPrecision(
      model.destination_currency, model.destination_amount);

    detailsDefaults = {
      ripple_transaction_id: 'none',
      invoice_id: 'none',
      memos: 'none'
    };

    formDefaults = {
      ripple_transaction_id: null,
      invoice_id: null,
      memos: null
    };

    defaultPaymentDetailModel = _.merge({}, model, detailsDefaults, this.setDefaults);
    defaultPaymentFormModel = _.merge({}, model, formDefaults, this.setDefaults);

    //todo - clean all this up. This abstraction is messy here
    //model.deposit, true === deposits, false === withdrawals
    var transactionType = model.deposit ? 'deposits' : 'withdrawals';

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
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('transactionId')} />
              </span>
              <span className="data">{model.id} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">
                {this.getDirectionHeader(model.deposit)}
              </span>
              <span className="data">{accountName}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('transactionAmount')} />
              </span>
              <span className="data">{formattedDestinationAmount} </span>
              <span className="currency">{model.destination_currency}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('transactionStatus')} />
              </span>
              <span className="data">
                {this.statusMap[transactionType][model.status]}
              </span>
            </p>
            {this.getDoneButton(defaultPaymentFormModel)}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <span className="date pull-left">
              {moment(model.createdAt).format('MMM D, YYYY HH:mm:ss.SSS z')}
            </span>
          </div>
          <div className="col-sm-1 col-xs-12 pull-right">
            <Chevron
              clickHandler={this.handleDetailIconClick.bind(this, model.id)}
              iconClasses="pull-right"
            />
          </div>
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
