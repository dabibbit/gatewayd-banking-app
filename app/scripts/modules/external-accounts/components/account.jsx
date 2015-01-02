"use strict";

var moment = require('moment');
var React = require('react');
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var AccountDetailContent = require('./account-detail-content.jsx');
var Chevron = require('../../../shared/components/glyphicon/chevron.jsx');

var Account = React.createClass({
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

  render: function() {
    var _this = this;
    var accountItemClasses = '';

    return (
      <li className={"payment-item list-group-item " + accountItemClasses}>
        <div className="row">
          <div className="col-sm-1 col-xs-12">
            <p>
              <span className="header">Id: </span>
              <span className="data">{this.props.model.get('id')} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Name: </span>
              <span className="data">{this.props.model.get('name')} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Bank Name: </span>
              <span className="data">{this.props.model.get('data') || 'none'} </span>
            </p>
          </div>
          <div className="col-sm-3 col-xs-12">
            <p>
              <span className="header">Federation Address: </span>
              <span className="data">{this.props.model.get('address')} </span>
            </p>
          </div>
          <div className="col-sm-2 col-xs-12 text-right">
            <p>
              <span className="header">Type: </span>
              <span className="data">{this.props.model.get('type')} </span>
            </p>
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
            {moment(this.props.model.get('createdAt')).format('MMM D, YYYY HH:mm z')}
          </span>
          <Chevron
            clickHandler={this.handleDetailIconClick.bind(this, this.props.model.get('id'))}
            iconClasses="pull-right"
          />
        </div>
        <div>
          {this.state.showDetails ?
            <AccountDetailContent model={this.props.model} accountDetailClassName={"details"}/>
            : false}
        </div>
      </li>
    );
  }
});

module.exports = Account;
