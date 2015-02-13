"use strict";

var moment = require('moment');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var AccountDetailContent = require('./account-detail-content.jsx');
var Chevron = require('../../../shared/components/glyphicon/chevron.jsx');

var Account = React.createClass({

  mixins: [IntlMixin],

  propTypes: {
    model: React.PropTypes.object
  },

  handleDetailIconClick: function(id) {
    this.setState({
      showDetails: !this.state.showDetails
    });
  },

  getInitialState: function() {
    return {
      showDetails: false
    };
  },

  getAccountType: function(type) {
    var typeMap = {
          acct: 'accountCustomer',
          gateway: 'accountGateway'
        };

    if (type && typeMap[type]) {
      return <FormattedMessage message={this.getIntlMessage(typeMap[type])} />
    }
  },

  getDefaultString: function(str) {
    return str || <FormattedMessage message={this.getIntlMessage('noData')} />
  },

  render: function() {
    var accountItemClasses = '',
        model = this.props.model;

    return (
      <li className={"payment-item list-group-item " + accountItemClasses}>
        <div className="row">
          <div className="col-sm-2 col-xs-12">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('accountId')} />
              </span>
              <span className="data">{model.id}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('accountName')} />
              </span>
              <span className="data">{model.name}</span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('accountBankName')} />
              </span>
              <span className="data">{this.getDefaultString(model.data)}</span>
            </p>
          </div>
          <div className="col-sm-2 col-xs-12">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('accountFederationAddress')} />
              </span>
              <span className="data">{model.address}</span>
            </p>
          </div>
          <div className="col-sm-2 col-xs-12 text-right">
            <p>
              <span className="header">
                <FormattedMessage message={this.getIntlMessage('accountType')} />
              </span>
              <span className="data">
                {this.getAccountType(model.type)}
              </span>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-10 col-xs-12">
            <span className="date pull-left">
              {moment(model.createdAt).format('MMM D, YYYY HH:mm z')}
            </span>
          </div>
          <div className="col-sm-2 col-xs-12">
            <Chevron
              clickHandler={this.handleDetailIconClick.bind(this, model.id)}
              iconClasses="pull-right"
            />
          </div>
        </div>
        <div>
          {this.state.showDetails ?
            <AccountDetailContent model={model} accountDetailClassName={"details"}/>
            : false}
        </div>
      </li>
    );
  }
});

module.exports = Account;
