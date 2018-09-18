import React from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'

import Order from './Order';
import InfiniteScrollPageLoader from './InfiniteScrollPageLoader';

class OrderList extends React.Component {
  render() {
    return (
      <div>
        {this.props.viewer.allOrders.edges.map(({node}) =>
          <Order key={node.id} order={node}/>
        )}
        <InfiniteScrollPageLoader onLoadMore={() => this._loadMore()}/>
      </div>
    )
  }

  _loadMore() {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    this.props.relay.loadMore(
      10,  // Fetch the next 10 feed items
      error => {
        console.log(error);
      },
    );
  }
}

export default createPaginationContainer(OrderList,
  graphql`
    fragment OrderList_viewer on Viewer @argumentDefinitions(
      count: {type: "Int", defaultValue: 10},
      cursor: {type: "String", defaultValue: null},
      filter: {type: "OrderFilter"}
    ) {
      allOrders(
        first: $count,
        after: $cursor,
        orderBy: dueDate_ASC,
        filter: $filter
      ) @connection(
        key: "OrderList_allOrders",
        filters: ["filter"]
      ) {
        edges {
          node {
            id,
            ...Order_order
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    query: graphql`
      # Pagination query to be fetched upon calling loadMore().
      # Notice that we re-use our fragment, and the shape of this query matches
      # our fragment spec.
      query OrderList_Pagination_Query(
        $count: Int!,
        $cursor: String!,
        $filter: OrderFilter!
      ) {
        viewer {
          ...OrderList_viewer @arguments(count: $count, cursor: $cursor, filter: $filter)
        }
      }
    `,
    getVariables: (props, paginationInfo, fragmentVariables) => {
      return {
        count: paginationInfo.count,
        cursor: paginationInfo.cursor,
        filter: fragmentVariables.filter
      }
    }
  });
