import React from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import Todo from './Todo';

class TodoList extends React.Component {
  render() {
    const {totalCount, completedCount, todos} = this.props.userTodoData;

    return (
      <section>
        <input
          checked={totalCount === completedCount}
          type="checkbox"
        />
        <ul>
          {todos.edges.map(edge =>
            <Todo
              key={edge.node.id}
              todo={edge.node}
            />
          )}
        </ul>
      </section>
    );
  }
}

export default createFragmentContainer(
  TodoList,
  graphql`
    # As a convention, we name the fragment as '<ComponentFileName>_<propName>'
    fragment TodoList_userTodoData on User {
      todos(first: 100) {
        edges {
          node {
            id,
            ...Todo_todo
          }
        }
      },
      id,
      totalCount,
      completedCount
    }
  `
)