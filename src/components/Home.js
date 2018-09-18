import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../relay-env'
import StorefrontPage from './StorefrontPage'

const HomeQuery = graphql`
  query Home_Query {
    viewer {
      ...StorefrontPage_viewer
    }
  }
`

class Home extends Component {
  render() {
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={HomeQuery}
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
