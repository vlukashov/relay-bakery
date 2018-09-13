import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {graphql, QueryRenderer} from 'react-relay';
import logo from './logo.svg';
import './App.css';

import environment from './relay-env';

class UserTodoList extends React.Component {
  static propTypes = {
    userID: PropTypes.string
  }

  static defaultProps = {
    // 'VXNlcjptZQ==' is base64 for 'User:me', which is defined in data/database.js
    userID: 'VXNlcjptZQ=='
  }

  render() {
    const {userID} = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query App_UserQuery($userID: ID!) {
            node(id: $userID) {
              id
            }
          }
        `}
        variables={{userID}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return <div>User ID: {props.node.id}</div>;
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
        <UserTodoList></UserTodoList>
      </div>
    );
  }
}

export default App;
