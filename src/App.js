import React, { Component } from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import logo from './logo.svg';
import './App.css';
import TodoList from './components/TodoList';

import environment from './relay-env';

class UserTodoList extends React.Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query App_ViewerQuery {
            viewer {
              id,
              # Reference the fragment defined in the TodoList component
              # (it would be nice avoid re-typing a string constant here)
              ...TodoList_userTodoData
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
          return (
            <div>
              <div>Todo list for User {props.viewer.id}:</div>
              <TodoList userTodoData={props.viewer} />
            </div>
          );
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
