"use strict";

var moment = require('moment');
var React = require('react');

var AccountDetailContent = React.createClass({
  propTypes: {
    model: React.PropTypes.object,
    accountDetailClassName: React.PropTypes.string
  },

  typeMap: {
    acct: 'customer',
    gateway: 'gateway'
  },

  render: function() {
    var model = this.props.model;

    return (
      <div className={this.props.accountDetailClassName}>
        <div className="row border-bottom">
          Updated {moment(model.updatedAt).format('MMM D, YYYY HH:mm z')}
        </div>
        <br />
        <div className="row">
          Account Id: {model.id}
        </div>
        <br />
        <div className="row">
          Bank Account Number: {model.uid || 'none'}
        </div>
        <br />
        <div className="row">
          <div className="col-sm-4 col-xs-12">
            Name: {model.name || 'none'}
          </div>
          <div className="col-sm-4 col-xs-12">
            Federation Address: {model.address}
          </div>
          <div className="col-sm-4 col-xs-12">
            Type: {this.typeMap[model.type]}
          </div>
        </div>
        <br />
        <div className="row">
          Bank Name: {model.data || 'none'}
        </div>
      </div>
    );
  }
});

module.exports = AccountDetailContent;
