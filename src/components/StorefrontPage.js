import React from 'react'
import {
  createRefetchContainer,
  graphql
} from 'react-relay'
import debounce from 'lodash/debounce';

import OrderList from './OrderList';

class StorefrontPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      showPastOrders: false
    };
    this._onFilterChanged = debounce(this._onFilterChanged.bind(this), 300);
  }

  render() {
    return (
      <div className="StorefrontPage">
        <div>
          <label>Search
            <input type="text" placeholder="Search"
              onChange={(e) => this._onSearchStringChanged(e.target.value)} />
          </label>
          <label>Show past orders
            <input type="checkbox"
              onChange={(e) => this._onShowPastOrdersChanged(e.target.checked)}/>
          </label>
          <button onClick={() => this._onNewOrder()}>New Order</button>
        </div>
        <OrderList viewer={this.props.viewer}/>
      </div>
    )
  }

  _onFilterChanged() {
    const {searchString, showPastOrders} = this.state;
    this.props.relay.refetch(fragmentVariables => {
      const filter = {
        ...fragmentVariables.filter,
        customer: {
          fullName_contains: searchString
        }
      };
      if (showPastOrders) {
        delete filter.dueDate_gte;
      }
      return {filter};
    });
  }

  _onSearchStringChanged(searchString) {
    this.setState({
      ...this.state,
      searchString
    });
    this._onFilterChanged();
  }

  _onShowPastOrdersChanged(showPastOrders) {
    this.setState({
      ...this.state,
      showPastOrders
    });
    this._onFilterChanged();
  }

  _onNewOrder() {
    console.log('new order');
  }
}

export default createRefetchContainer(StorefrontPage,
  graphql`
    fragment StorefrontPage_viewer on Viewer @argumentDefinitions(
      filter: {type: "OrderFilter"}
    ) {
      ...OrderList_viewer @arguments(filter: $filter)
    }
  `,
  graphql`
    # Refetch query to be fetched upon calling 'refetch'.
    # Notice that we re-use our fragment and the shape of this query matches our fragment spec.
    query StorefrontPage_Refetch_Query($filter: OrderFilter) {
      viewer {
        ...OrderList_viewer @arguments(filter: $filter)
      }
    }
  `);
