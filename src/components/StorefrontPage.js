import React from 'react'
import {
  createFragmentContainer,
  graphql
} from 'react-relay'

import Order from './Order';

class StorefrontPage extends React.Component {
  render() {
    return (
      <div>
        {this.props.viewer.allOrders.edges.map(({node}) =>
          <Order key={node.id} order={node}/>
        )}
      </div>
    )
  }
}

export default createFragmentContainer(StorefrontPage, graphql`
  fragment StorefrontPage_viewer on Viewer @argumentDefinitions(
    filter: {type: "OrderFilter"}
  ) {
    allOrders(
      first: 10,
      orderBy: dueDate_ASC,
      filter: $filter
    ) @connection(
      key: "Storefront_allOrders",
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
`)
