"use strict";

var moment = require('moment');
var React = require('react');

var PaymentDetailContent = React.createClass({
  propTypes: {
    model: React.PropTypes.object,
    paymentDetailClassName: React.PropTypes.string
  },

  render: function() {
    return (
      <div className={this.props.paymentDetailClassName}>
        <div className="row border-bottom">
          Updated {moment(this.props.model.get('updatedAt')).format('MMM D, YYYY HH:mm z')}
        </div>
        <br />
        <div className="row">
          Transaction Id: {this.props.model.get('id')}
        </div>
        <br />
        <div className="row">
          <div className="col-sm-6 col-xs-12">
            Source Account: {
              this.props.model.get('fromAccount') ?
                this.props.model.get('fromAccount').name + ' - ' + this.props.model.get('fromAccount').address
                : null
            }
          </div>
          <div className="col-sm-4 col-xs-12">
            Amount: {this.props.model.get('source_amount')}
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Currency: {this.props.model.get('source_currency')}
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-sm-6 col-xs-12">
            Destination Account: {
              this.props.model.get('toAccount') ?
                this.props.model.get('toAccount').name + ' - ' + this.props.model.get('toAccount').address
                : null
            }
          </div>
          <div className="col-sm-4 col-xs-12">
            Amount: {this.props.model.get('destination_amount')}
          </div>
          <div className="col-sm-3 col-xs-12 text-right">
            Currency: {this.props.model.get('destination_currency')}
          </div>
        </div>
        <br />
        <div className="row">
          Ripple Transaction Id: {this.props.model.get('ripple_transaction_id') || 'none'}
        </div>
        <br />
        <div className="row">
          Invoice Id: {this.props.model.get('invoice_id') || 'none'}
        </div>
        <br />
        <div className="row">
          Memos: {this.props.model.get('memos') || 'none'}
        </div>
      </div>
    );
  }
});

module.exports = PaymentDetailContent;
