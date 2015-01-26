"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');
var Modal = require('react-bootstrap').Modal;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var paymentActions = require('../actions');
var FormValidationMixin = require('../../../shared/mixins/components/form_validation_mixin');
var session = require('../../session/models/session');

var PaymentCreate = React.createClass({
  mixins: [IntlMixin, FormValidationMixin],

  refNameTypeMap: {
    source_account_id: 'number',
    source_amount: 'number',
    source_currency: 'string',
    destination_account_id: 'number',
    destination_amount: 'number',
    destination_currency: 'string',
    invoice_id: 'string',
    memos: 'string'
  },

  // used in getInitialState mixin method
  initialState: {
    disableForm: false,
    disableSubmitButton: true,
    submitButtonLabel: 'transactionFormSubmit1'
  },

  // list of custom event bindings and actions
  // used in componentDidMount mixin method
  handleAfterMount: function() {
    this.fetchAccounts.call(this);
  },

  // list of custom event unbindings and actions
  // used in componentWillUnmount mixin method
  handleAfterUnmount: function() {},

  // list of actions to invoke after form input changes
  // used in handleChange mixin method
  handleAfterChange: function(refName, fieldValue) {},

  // list of actions to dispatch when validating field on blur
  // used in validateField mixin method
  handleValidations: function(refName, fieldValue) {
    paymentActions.validateField(refName, fieldValue);

    this.populateDestinationAmountCurrency(refName, fieldValue);
  },

  // list of actions to dispatch after successful creation
  // used in dispatchCreateComplete mixin method
  handleAfterCreate: function(data) {
    paymentActions.sendPaymentComplete(data.externalTransaction);

    this.hideForm();
  },

  // on model sync error
  handleSubmissionError: function() {
    this.setState({
      disableForm: false,
      disableSubmitButton: false,
      submitButtonLabel: 'transactionFormSubmit2'
    });
  },

  handleSubmit: function(e) {
    e.preventDefault();


    var payment = this.buildFormObject(this.refs);

    this.setState({
      disableForm: true,
      submitButtonLabel: 'transactionFormSubmit3'
    });

    // standard submit action - sendPaymentAttempt, flagAsDoneWithEdits, flagAsInvoicePaid
    this.props.submitActions[0](payment);
  },

  handleSecondarySubmit: function(e) {
    e.preventDefault();

    // flagAsFailed
    this.props.submitActions[1](this.props.model.get('id'));
  },

  sourceOptions: '',

  destinationOptions: '',

  buildAccountOptions: function(accounts) {
    return _.map(accounts, account => {
      return (
        <option key={account.id} value={account.id}>{account.name} - {account.uid}</option>
      );
    });
  },

  // TODO - use accountsActions with dispatcher to fetch accounts collection
  // listen to sync on instantiated account collection
  fetchAccounts: function() {
    $.ajax({
      type: 'GET',
      url: session.get('gatewaydUrl') + path.join('/', 'v1/external_accounts'),
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', session.get('credentials'));
      }
    }).done(data => {
      data = data.external_accounts;

      if (this.props.model.get('deposit')) {

        // bank to ripple transactions always use gateway account as the destination
        this.sourceOptions = this.buildAccountOptions(_.where(data, {type: 'acct'}));
        this.destinationOptions = this.buildAccountOptions(_.where(data, {type: 'gateway'}));
      } else {

        // ripple to bank transactions always use gateway account as the source
        this.sourceOptions = this.buildAccountOptions(_.where(data, {type: 'gateway'}));
        this.destinationOptions = this.buildAccountOptions(_.where(data, {type: 'acct'}));
      }

      this.setState({
        disableSubmitButton: false
      });
    }).fail((jqHXR, status) => {
      console.warn('Account Fetch Failed:', status);
    });
  },

  populateDestinationAmountCurrency: function(refName, fieldValue) {
    var whitelist = [
      'source_amount', 'destination_amount', 'source_currency', 'destination_currency'
    ];

    if (_.isNaN(fieldValue) || !_.contains(whitelist, refName)) {
      return false;
    }

    var amountInverseMap = {
      destination_amount: 'source_amount',
      source_amount: 'destination_amount'
    };

    var currencyInverseMap = {
      destination_currency: 'source_currency',
      source_currency: 'destination_currency'
    };

    var amountInverseRef = amountInverseMap[refName];
    var currencyInverseRef = currencyInverseMap[refName];
    var newAmount, newCurrency;

    // if source amount is entered, corresponding destination amount is populated if empty or not a number
    if (!_.isUndefined(amountInverseRef) && !_.isNumber(this.state[amountInverseRef].value)) {
      newAmount = _.extend(this.state[amountInverseRef], {
        value: fieldValue
      });

      this.setState(newAmount);

      paymentActions.validateField(amountInverseRef, fieldValue);

      return false;
    }

    // if source currency is entered, corresponding destination currency is populated if empty
    if (!_.isUndefined(currencyInverseRef) && _.isEmpty(this.state[currencyInverseRef].value)) {
      newCurrency = _.extend(this.state[currencyInverseRef], {
        value: fieldValue
      });

      this.setState(newCurrency);

      paymentActions.validateField(currencyInverseRef, fieldValue);
    }
  },

  hideForm: function() {
    this.props.onRequestHide();
  },

  getSubmitButton: function(state) {
    if (!state) {
      return false;
    }

    return <FormattedMessage message={this.getIntlMessage(state)}/>;
  },

  displayNewPaymentButton: function() {
    return (
      <Button className="pull-right" bsStyle="primary" bsSize="large" type="submit"
        disabled={this.state.disableForm || this.state.disableSubmitButton}
        block>
        {this.getSubmitButton(this.state.submitButtonLabel)}
      </Button>
    );
  },

  displayEditPaymentButton: function() {
    return (
      <div className="modal-footer">
        <div className="col-sm-12 col-sm-offset-1 col-xs-12 col-xs-offset-1">
          <h4>
            <FormattedMessage message={this.getIntlMessage('transactionConfirmHeader')} />
          </h4>
        </div>
        <div className="col-sm-12 col-sm-offset-2 col-xs-12 col-xs-offset-1">
          <ButtonToolbar>
            <Button
              bsStyle="success"
              bsSize="large"
              type="submit"
            >
              <span className="glyphicon glyphicon-thumbs-up" />&nbsp;
              <FormattedMessage message={this.getIntlMessage('transactionFormSucceeded')} />
            </Button>
            <Button
              bsStyle="danger"
              bsSize="large"
              onClick={this.handleSecondarySubmit}
            >
              <span className="glyphicon glyphicon-thumbs-down" />&nbsp;
              <FormattedMessage message={this.getIntlMessage('transactionFormFailed')} />
            </Button>
            <a onClick={this.hideForm}>
              &nbsp;
              <FormattedMessage message={this.getIntlMessage('transactionFormCancel')} />
            </a>
          </ButtonToolbar>
        </div>
      </div>
    );
  },

  submitButton: function() {
    var formTypeMap = {};

    formTypeMap.newPayment = this.displayNewPaymentButton;
    formTypeMap.editPayment = this.displayEditPaymentButton;

    if (!_.isUndefined(formTypeMap[this.props.formType])) {
      return formTypeMap[this.props.formType]();
    }

    return false;
  },

  render: function() {
    var source_account_id = this.state.source_account_id;
    var source_amount = this.state.source_amount;
    var source_currency = this.state.source_currency;
    var destination_account_id = this.state.destination_account_id;
    var destination_amount = this.state.destination_amount;
    var destination_currency = this.state.destination_currency;
    var invoice_id = this.state.invoice_id;
    var memos = this.state.memos;

    return (
      <form onSubmit={this.handleSubmit}>
        <Row>
          <Col xs={4}>
            <Input type="select" ref={source_account_id.refName}
              label="Source:"
              bsStyle={this.validationMap[source_account_id.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, source_account_id.refName)}
              onChange={this.handleChange.bind(this, source_account_id.refName)}
              value={source_account_id.value}
              hasFeedback
              autofocus={true}
            >
              {this.sourceOptions}
            </Input>
            {this.errorMessageLabel(source_account_id.errorMessage)}
          </Col>
          <Col xs={4}>
            <Input type="text" ref={source_amount.refName}
              label="Amount:"
              bsStyle={this.validationMap[source_amount.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, source_amount.refName)}
              onChange={this.handleChange.bind(this, source_amount.refName)}
              value={source_amount.value}
              hasFeedback
            />
            {this.errorMessageLabel(source_amount.errorMessage)}
          </Col>
          <Col xs={4}>
          <Input type="text" ref={source_currency.refName}
              label="Currency:"
              bsStyle={this.validationMap[source_currency.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, source_currency.refName)}
              onChange={this.handleChange.bind(this, source_currency.refName)}
              value={source_currency.value}
              hasFeedback
            />
            {this.errorMessageLabel(source_currency.errorMessage)}
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Input type="select" ref={destination_account_id.refName}
              label="Destination:"
              bsStyle={this.validationMap[destination_account_id.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, destination_account_id.refName)}
              onChange={this.handleChange.bind(this, destination_account_id.refName)}
              value={destination_account_id.value}
              hasFeedback
            >
              {this.destinationOptions}
            </Input>
            {this.errorMessageLabel(destination_account_id.errorMessage)}
          </Col>
          <Col xs={4}>
            <Input type="text" ref={destination_amount.refName}
              label="Amount:"
              bsStyle={this.validationMap[destination_amount.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, destination_amount.refName)}
              onChange={this.handleChange.bind(this, destination_amount.refName)}
              value={destination_amount.value}
              hasFeedback
            />
            {this.errorMessageLabel(destination_amount.errorMessage)}
          </Col>
          <Col xs={4}>
            <Input type="text" ref={destination_currency.refName}
              label="Currency:"
              bsStyle={this.validationMap[destination_currency.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, destination_currency.refName)}
              onChange={this.handleChange.bind(this, destination_currency.refName)}
              value={destination_currency.value}
              hasFeedback
            />
            {this.errorMessageLabel(destination_currency.errorMessage)}
          </Col>
        </Row>

        <Input type="hidden" ref={invoice_id.refName} value={invoice_id.value} />

        <Input type="textarea" ref={memos.refName}
          label="Memos:"
          bsStyle={this.validationMap[memos.inputState]}
          disabled={this.state.disableForm}
          onBlur={this.validateField.bind(this, memos.refName)}
          onChange={this.handleChange.bind(this, memos.refName)}
          value={memos.value}
          hasFeedback
          autofocus={true}
        />
        {this.errorMessageLabel(memos.errorMessage)}

        {this.submitButton()}
      </form>
    );
  }
});

module.exports = PaymentCreate;
