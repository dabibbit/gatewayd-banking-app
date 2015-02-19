"use strict";

var _ = require('lodash');
var React = require('react');
var Modal = require('react-bootstrap').Modal;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var accountActions = require('../actions');
var FormValidationMixin = require('../../../shared/mixins/components/form_validation_mixin');

var AccountCreate = React.createClass({
  mixins: [FormValidationMixin],

  refNameTypeMap: {
    name: 'string',
    address: 'string',
    uid: 'string',
    type: 'string',
    data: 'string'
  },

  // used in getInitialState mixin method
  initialState: {
    disableForm: false,
    submitButtonLabel: 'Create Account'
  },

  // list of custom event bindings and actions on mount
  // used in componentDidMount mixin method
  handleAfterMount: function() {},

  // list of custom event unbindings and actions on unmount
  // used in componentWillUnmount mixin method
  handleAfterUnmount: function() {
    accountActions.reset();
  },

  // list of actions to invoke after form input changes
  // used in handleChange mixin method
  handleAfterChange: function(refName, fieldValue) {},

  // list of actions to dispatch when validating field on blur
  // used in validateField mixin method
  handleValidations: function(refName, fieldValue) {
    accountActions.validateField(refName, fieldValue);
  },

  // list of actions to dispatch after successful creation
  // used in dispatchCreateComplete mixin method
  handleAfterCreate: function(data) {
    this.hideForm();

    accountActions.createAccountComplete(data.externalAccount);
  },

  // on model sync error
  handleSubmissionError: function() {
    this.setState({
      disableForm: false,
      submitButtonLabel: 'Re-Submit Account Info?',
    });
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var account = this.buildFormObject(this.refs);

    this.setState({
      disableForm: true,
      submitButtonLabel: 'Creating Account...',
    });

    accountActions.createAccountAttempt(account);
  },

  hideForm: function() {
    this.props.onRequestHide();
  },

  render: function() {
    var type = this.state.type;
    var name = this.state.name;
    var data = this.state.data;
    var uid = this.state.uid;
    var address = this.state.address;

    return (
      <Modal
        title="Create Account"
        backdrop={true}
        onRequestHide={this.hideForm}
        animation={false}
      >
        <div className="modal-body">
          <form onSubmit={this.handleSubmit}>

            <Input type="select" ref={type.refName}
              label={this.requiredLabel("Type: ")}
              bsStyle={this.validationMap[type.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, type.refName)}
              onChange={this.handleChange.bind(this, type.refName)}
              hasFeedback
              autofocus={true}
            >
              <option value="acct">Customer</option>
              <option value="gateway">Gateway</option>
            </Input>
            {this.errorMessageLabel(type.errorMessage)}

            <Input type="text" ref={name.refName}
              label="Name:"
              bsStyle={this.validationMap[name.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, name.refName)}
              onChange={this.handleChange.bind(this, name.refName)}
              hasFeedback
            />
            {this.errorMessageLabel(name.errorMessage)}

            <Input type="text" ref={data.refName}
              label="Bank Name:"
              bsStyle={this.validationMap[data.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, data.refName)}
              onChange={this.handleChange.bind(this, data.refName)}
              hasFeedback
            />
            {this.errorMessageLabel(data.errorMessage)}

            <Input type="text" ref={uid.refName}
              label="Bank Account Number:"
              bsStyle={this.validationMap[uid.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, uid.refName)}
              onChange={this.handleChange.bind(this, uid.refName)}
              hasFeedback
            />
            {this.errorMessageLabel(uid.errorMessage)}

            <Input type="text" ref={address.refName}
              label={this.requiredLabel("Federation Address: ")}
              bsStyle={this.validationMap[address.inputState]}
              disabled={this.state.disableForm}
              onBlur={this.validateField.bind(this, address.refName)}
              onChange={this.handleChange.bind(this, address.refName)}
              hasFeedback
            />
            {this.errorMessageLabel(address.errorMessage)}

            <Button className="pull-right" bsStyle="primary" bsSize="large" type="submit"
              disabled={this.state.disableForm || this.state.disableSubmitButton}
              block>
              {this.state.submitButtonLabel}
            </Button>
          </form>
        </div>
      </Modal>
    );
  }
});

module.exports = AccountCreate;
