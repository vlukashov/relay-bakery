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
    this._onFilterChanged = debounce(this._onFilterChanged.bind(this), 300);
  }

  render() {
    return (
      <div className="StorefrontPage">
        <div>
          <label>
            Filter
            <input type="text" onChange={(e) => this._onFilterChanged(e.target.value)} />
          </label>
        </div>
        <OrderList viewer={this.props.viewer}/>
      </div>
    )
  }

  _onFilterChanged(filterString) {
    this.props.relay.refetch(fragmentVariables => {
      return {
        filter: {
          ...fragmentVariables.filter,
          customer: {
            fullName_contains: filterString
          }
        }
      };
    });
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
