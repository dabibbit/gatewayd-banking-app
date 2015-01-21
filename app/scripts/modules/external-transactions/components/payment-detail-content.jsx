"use strict";

var moment = require('moment');
var React = require('react');
var currencyPrecision = require('../../../shared/currency-precision');

var PaymentDetailContent = React.createClass({
  propTypes: {
    model: React.PropTypes.object,
    paymentDetailClassName: React.PropTypes.string
  },

  render: function() {
    var model = this.props.model;

    var formattedSourceAmount = currencyPrecision(
      model.source_currency, model.source_amount);

    var formattedDestinationAmount = currencyPrecision(
      model.destination_currency, model.destination_amount);

    return (
      <div className={this.props.paymentDetailClassName}>
        <div className="row border-bottom">
          Updated {moment(model.updatedAt).format('MMM D, YYYY HH:mm z')}
        </div>
        <br />
        <div className="row">
          Transaction Id: {model.id}
        </div>
        <br />
        <div className="row">
          <div className="col-sm-6 col-xs-12">
            Source Account: {
              model.fromAccount ?
                model.fromAccount.name + ' - ' + model.fromAccount.address
                : null
            }
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Amount: {formattedSourceAmount}
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Currency: {model.source_currency}
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-sm-6 col-xs-12">
            Destination Account: {
              model.toAccount ?
                model.toAccount.name + ' - ' + model.toAccount.address
                : null
            }
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Amount: {formattedDestinationAmount}
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Currency: {model.destination_currency}
          </div>
        </div>
        <br />
        <div className="row">
          Ripple Transaction Id: {model.ripple_transaction_id || 'none'}
        </div>
        <br />
        <div className="row">
          Invoice Id: {model.invoice_id || 'none'}
        </div>
        <br />
        <div className="row">
          Memos: {model.memos || 'none'}
        </div>
      </div>
    );
  }
});

module.exports = PaymentDetailContent;
