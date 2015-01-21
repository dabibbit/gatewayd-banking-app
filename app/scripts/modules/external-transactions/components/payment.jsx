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

var Payment = React.createClass({
  propTypes: {
    model: React.PropTypes.object
  },

  statusMap: {

    // bank to ripple
    inbound: {
      invoice: 'quote submitted for review',
      queued: 'ripple transaction pending',
      cleared: 'cleared',
      failed: 'failed'
    },

    // ripple to bank
    outbound: {
      invoice: 'quote received',
      queued: 'transaction ready to receive',
      cleared: 'cleared',
      failed: 'failed'
    }
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

  getInitialState: function() {
    return {
      refreshIconClasses: '',
      showDetails: false
    };
  },

  componentDidMount: function() {
    // this.props.model.on('pollingStart', this.showSpinningIcon);
    // this.props.model.on('pollingStop', this.hideSpinningIcon);
  },

  componentWillUnmount: function() {
    // this.props.model.off('pollingStart pollingStop');
  },

  render: function() {
    var _this = this;
    var doneButton, refreshIcon, fromAddress, toAddress;
    var model = this.props.model;
    var paymentItemClasses = 'modal-container';
    var formattedDestinationAmount = currencyPrecision(
      model.destination_currency, model.destination_amount);

    // model.deposit, true === inbound, false === outbound
    var directionMap = {
      true: 'inbound',
      false: 'outbound'
    };
    var direction = directionMap[model.deposit];

    if (direction === 'outbound' && model.status === 'queued') {
      doneButton = (
        <ModalTrigger modal={
          <PaymentCreateModalForEditing
            title={"Process Ripple to Bank Queued Transaction"}
            formType={"editPayment"}
            submitActions={[paymentActions.flagAsDoneWithEdits, paymentActions.flagAsFailed]}
            model={model} // converted to form model
          />
        }>
          <button className="btn pull-right">
            Process
          </button>
        </ModalTrigger>
      );
    } else if (direction === 'inbound' && model.status === 'invoice') {
      doneButton = (
        <ModalTrigger modal={
          <PaymentCreateModalForEditing
            title={"Process Bank to Ripple Invoice Transaction"}
            formType={"editPayment"}
            submitActions={[paymentActions.flagAsInvoicePaid, paymentActions.flagAsFailed]}
            model={model} // converted to form model
          />
        }>
          <button className="btn pull-right">
            Process
          </button>
        </ModalTrigger>
      );
    } else {
      doneButton = false;
    }

    return (
      <li className={"payment-item list-group-item " + paymentItemClasses} ref="container">
        <div className="row">
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Id: </span>
              <span className="data">{model.id} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Destination Account: </span>
              <span className="data">
                {
                  model.toAccount ?
                    model.toAccount.name : null
                }
              </span>
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
                {this.statusMap[direction][model.status]}
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
            <PaymentDetailContent model={model} paymentDetailClassName={"details"}/>
            : false}
        </div>
      </li>
    );
  }
});

module.exports = Payment;
