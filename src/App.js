import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import logo from './logo.svg';
import './App.css';

import environment from './relay-env';

class RelayApp extends React.Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query App_UserQuery {
            viewer {
              id
            }
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return <div>User ID: {props.viewer.id}</div>;
        }}
      />
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <RelayApp></RelayApp>
      </div>
    );
  }
}

export default App;
