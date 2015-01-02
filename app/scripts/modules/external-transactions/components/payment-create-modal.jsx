"use strict";

var _ = require('lodash');
var React = require('react');
var Modal = require('react-bootstrap').Modal;
var paymentCreateFormModel = require('../models/payment-create');
var PaymentCreateForm = require('./payment-create-form.jsx');
var paymentActions = require('../actions');

var PaymentCreateModal = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    formType: React.PropTypes.string,
    submitActions: React.PropTypes.array,
    model: React.PropTypes.object // optional
  },

  hideForm: function() {
    this.props.onRequestHide();
  },

  componentWillMount: function() {
    if (!_.isUndefined(this.props.model)) {
      paymentActions.populateForm(this.props.model.toJSON());
    }
  },

  componentWillUnmount: function() {
    paymentActions.reset();
  },

  render: function() {
    return (
      <Modal
        title={this.props.title}
        backdrop={true}
        onRequestHide={this.hideForm}
        animation={false}
      >
        <div className="modal-body">
          <PaymentCreateForm
            model={paymentCreateFormModel}
            onRequestHide={this.hideForm}
            submitActions={this.props.submitActions}
            formType={this.props.formType}
          />
        </div>
      </Modal>
    );
  }
});

module.exports = PaymentCreateModal;
