import React from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay';

class Order extends React.Component {
  render() {
    return (
      <dl>
        <dt>State</dt>
        <dd>{this.props.order.state}</dd>

        <dt>Due date</dt>
        <dd>{this.props.order.dueDate}</dd>

        <dt>Customer</dt>
        <dd>{this.props.order.customer.fullName}</dd>

        <dt>Pickup location</dt>
        <dd>{this.props.order.pickupLocation.name}</dd>

        <dt>Items</dt>
        <dd>{this.props.order.items.edges.map(({node}) =>
            <div key={node.id}>
              {node.product.name}: {node.quantity} pcs
            </div>
          )}
        </dd>
      </dl>
    )
  }
}

const FragmentContainer = createFragmentContainer(Order, graphql`
  fragment Order_order on Order {
    id,
    state,
    dueDate,
    customer {
      fullName
    },
    pickupLocation {
      name
    },
    items(first: 6) @connection(key: "Order_items", filters: []) {
      edges {
        node {
          id,
          quantity,
          product {
            name
          }
        }
      }
    }
  }
`)

export default FragmentContainer;