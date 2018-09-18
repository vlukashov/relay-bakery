import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import startOfToday from 'date-fns/start_of_today'
import environment from '../relay-env'
import StorefrontPage from './StorefrontPage'

const HomeQuery = graphql`
  query Home_Query($filter: OrderFilter) {
    viewer {
      ...StorefrontPage_viewer @arguments(filter: $filter)
    }
  }
`

class Home extends Component {
  render() {
    const filter = {
      dueDate_gte: startOfToday().toISOString()
    };

    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={HomeQuery}
          variables={{filter}}
          render={({error, props}) => {
            if (error) {
              return <div>{error.message}</div>
            } else if (props) {
              return <StorefrontPage viewer={props.viewer} />
            }
            return <div>Loading</div>
          }}
        />
      </div>
    )
  }
}

export default Home
