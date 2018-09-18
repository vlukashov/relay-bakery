import React from 'react';

import './OrderStatusBadge.css';

class OrderStatusBadge extends React.Component {
  render() {
    const status = this.props.status ? this.props.status.toLowerCase() : '?';
    return (
      <div className={`OrderStatusBadge ${ this.props.className }`} status={status}>
        <div className="wrapper">
        {status !== 'delivered'
          ? <span>{status}</span>
          : <svg className="icon"
                 viewBox="0 0 16 16"
                 preserveAspectRatio="xMidYMid meet"
                 focusable="false">
              <g><path d="M7.3 14.2l-7.1-5.2 1.7-2.4 4.8 3.5 6.6-8.5 2.3 1.8z"></path></g>
            </svg>
        }
        </div>
      </div>
    )
  }
}

export default OrderStatusBadge;