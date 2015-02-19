"use strict";

var moment = require('moment');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');

var AccountDetailContent = React.createClass({

  mixins: [IntlMixin],

  propTypes: {
    model: React.PropTypes.object,
    accountDetailClassName: React.PropTypes.string
  },

  typeMap: {
    acct: 'accountCustomer',
    gateway: 'accountGateway'
  },

  getDefaultString: function(str) {
    return str || <FormattedMessage message={this.getIntlMessage('noData')} />
  },

  render: function() {
    var model = this.props.model;

    return (
      <div className={this.props.accountDetailClassName}>
        <div className="row border-bottom">
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountUpdated')} />
            {moment(model.updatedAt).format('MMM D, YYYY HH:mm:ss.SSS z')}
            <br />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountId')} />
            {model.id}
            <br />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountBankAccount')} />
            {this.getDefaultString(model.uid)}
            <br />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountName')} />
            {this.getDefaultString(model.name)}
          </div>
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountFederationAddress')} />
            {this.getDefaultString(model.address)}
          </div>
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountType')} />
            <FormattedMessage message={this.getIntlMessage(this.typeMap[model.type])} />
            <br />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            <FormattedMessage message={this.getIntlMessage('accountBankName')} />
            {this.getDefaultString(model.data)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = AccountDetailContent;
