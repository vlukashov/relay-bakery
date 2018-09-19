import React from 'react';
import {
  createFragmentContainer,
  graphql
} from 'react-relay';
import format from 'date-fns/format';

import createOrder from '../mutations/createOrder';

class OrderEditor extends React.Component {
  constructor(props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
  }

  render() {
    const now = format(new Date(), 'YYYY-MM-DDTHH:mm');
    return (
      <div className="OrderEditor">
        <form onSubmit={this._onSubmit}>
          <h1>New Order</h1>
          <label>Due date <input name="dueDate" type="datetime-local" defaultValue={now}/></label><br/>
          <label>Pickup location <input name="pickupLocation" type="text" defaultValue="cjm7dto1y00c70152sijif26i"/></label><br/>
          <label>Customer <input name="customer" type="text" defaultValue="You"/></label><br/>
          <label>Phone number <input name="phoneNumber" type="tel" defaultValue="+123 456"/></label><br/>
          <label>Additional details <input name="additionalDetails" type="text"/></label><br/>
          <label>Product <input name="product" type="text" defaultValue="cjm7dtnuf00bd0152qnplaekn"/></label><br/>
          <label>Quantity <input name="quantity" type="number" defaultValue="1"/></label><br/>
          <label>Comment <input name="comment" type="text"/></label><br/>
          <label>Place the order <input name="submit" type="submit"/></label>
        </form>
      </div>
    )
  }

  _onSubmit(event) {
    event.preventDefault();
    const form = [...event.target.elements]
      .reduce((data, element) => {
        data[element.name] = element.value;
        return data;
      }, {});

    const order = {
      dueDate: form.dueDate,
      customer: {
        fullName: form.customer,
        phoneNumber: form.phoneNumber,
        details: form.additionalDetails
      },
      pickupLocationId: form.pickupLocation,
      items: [
        {
          productId: form.product,
          quantity: form.quantity | 0,
          comment: form.comment
        }
      ]
    };

    createOrder(this.props.relay.environment, this.props.viewer.id, order);
    this.props.onClosed();
  }
}

const FragmentContainer = createFragmentContainer(OrderEditor, graphql`
  fragment OrderEditor_viewer on Viewer {
    id
  }
`);

export default FragmentContainer;