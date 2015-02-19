"use strict";

var _ = require('lodash');
var Label = require('react-bootstrap').Label;

var FormValidationMixin = {
  validationMap: {
    valid: 'success',
    invalid: 'warning'
  },

  initializeRefs: function() {
    var _this = this;
    var formRefs = {};
    var keys = _.keys(this.refNameTypeMap);

    _.each(keys, function(refName) {
      formRefs[refName] = {
        refName: refName,
        value: _this.props.model.get(refName) || '',
        inputState: null,
        errorMessage: ''
      };
    });

    return formRefs;
  },

  getInitialState: function() {
    var formRefs = this.initializeRefs();

    return _.extend(this.initialState, formRefs);
  },

  componentDidMount: function() {
    this.props.model.on('invalid', this.showFailedValidationResult);
    this.props.model.on('validationComplete', this.handleValidationResult);
    this.props.model.on('sync', this.dispatchCreateComplete);
    this.props.model.on('error', this.handleSubmissionError);

    this.handleAfterMount();
  },

  componentWillUnmount: function() {
    this.props.model.off('invalid validationComplete sync error');

    this.handleAfterUnmount();
  },

  handleChange: function(refName, e) {
    var updatedInput = _.extend(this.state[refName], {
      value: e.target.value
    });

    this.setState(updatedInput);

    this.handleAfterChange(refName, e.target.value);
  },

  formatInput: function(rawInputRef, type) {

    //selects now return array.
    var formattedInput = rawInputRef.getValue().toString().trim();

    if (!formattedInput) {
      return null;
    }

    return type === 'number' ? Number(formattedInput) : formattedInput;
  },

  buildFormObject: function(refKeys) {
    var _this = this;

    return _.mapValues(refKeys, function(value, key) {
      return _this.formatInput(_this.refs[key], _this.refNameTypeMap[key]);
    });
  },

  setErrorMessage: function(refName, errorMessage) {
    var invalidField = _.extend(this.state[refName], {
      inputState: 'invalid',
      errorMessage: errorMessage
    });

    this.setState(invalidField);
  },

  // executed when invalid event is triggered from model
  showFailedValidationResult: function(model, validationError) {
    var _this = this;

    this.handleSubmissionError();

    _.each(validationError, function(attribute) {
      var refName = _.keys(attribute)[0];
      var firstErrorMessage = attribute[refName][0];

      _this.setErrorMessage(refName, firstErrorMessage);
    });
  },

  handleValidationResult: function(isValid, refName, errorMessage) {
    if (isValid) {
      var validField = _.extend(this.state[refName], {
        inputState: 'valid',
        errorMessage: ''
      });

      this.setState(validField);
    } else {
      this.setErrorMessage(refName, errorMessage);
    }
  },

  clearFieldValidation: function(refName) {
    var clearFieldValidation = _.extend(this.state[refName], {
      inputState: null,
      errorMessage: ''
    });

    this.setState(clearFieldValidation);
  },

  validateField: function(refName) {
    var fieldValue = this.formatInput(this.refs[refName], this.refNameTypeMap[refName]);

    // remove any previous messages/styling before re-validating
    this.clearFieldValidation(refName);

    if (fieldValue !== null) {
      this.handleValidations(refName, fieldValue);
    }
  },

  dispatchCreateComplete: function(model, data) {
    this.handleAfterCreate(data);
  },

  requiredLabel: function(labelName) {
    return (
      <div>
        <Label bsStyle="info">Required</Label> {labelName}
      </div>
    );
  },

  errorMessageLabel: function(errorMessage) {
    return (
      <Label bsStyle="warning">{errorMessage}</Label>
    );
  }
};

module.exports = FormValidationMixin;
