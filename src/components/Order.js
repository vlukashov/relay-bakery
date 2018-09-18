import React from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay';

import format from 'date-fns/format';
import isToday from 'date-fns/is_today';

import './Order.css';
import './OrderStatusBadge.js';
import OrderStatusBadge from './OrderStatusBadge.js';

class Order extends React.Component {
  render() {
    const {order, header, secondaryHeader} = this.props;
    return (
      <div className="Order">
        <div className="group-heading" hidden={!header}>
          <span className="main">{header}</span>
          <span className="secondary">{secondaryHeader}</span>
        </div>
        <div className="wrapper" onClick={() => {this._cardClick()}}>
          <div className="info-wrapper">
            <OrderStatusBadge className="badge" status={order.state}/>
            <div className="time-place">
              <h3 className="time">{this._formatTime(order.dueDate)}</h3>
              <div className="secondary-time">{this._formatTimeSecondary(order.dueDate)}</div>
              <div className="place">{order.pickupLocation.name}</div>
            </div>
          </div>
          <div className="name-items">
            <h3 className="name">{order.customer.fullName}</h3>
            <div className="goods">
            {order.items.edges.map(({node}) =>
              <div className="goods-item" key={node.id}>
                <span className="count">{node.quantity}</span>
                <div>{node.product.name}</div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  _formatTime(dueDate) {
    return format(dueDate, isToday(dueDate) ? 'h:mm A' : 'MMM D');
  }

  _formatTimeSecondary(dueDate) {
    return isToday(dueDate) ? '' : format(dueDate, 'dddd');
  }

  _cardClick() {
    console.log(`clicked order ${this.props.order.id}`);
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