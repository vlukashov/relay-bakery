import React from 'react';
import {graphql, createFragmentContainer} from 'react-relay';

import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';

class Todo extends React.Component {
  render() {
    const {complete, text} = this.props.todo;

    return (
      <li>
        <div>
          <input
            checked={complete}
            type="checkbox"
            onChange={this._handleCompleteChange}
          />
          <label>
            {text}
          </label>
        </div>
      </li>
    );
  }

  _handleCompleteChange = (event) => {
    const complete = event.target.checked;
    ChangeTodoStatusMutation.commit(
      this.props.relay.environment,
      complete,
      this.props.todo,
    );
  }
}

export default createFragmentContainer(
  Todo,
  graphql`
    # As a convention, we name the fragment as '<ComponentFileName>_<propName>'
    fragment Todo_todo on Todo {
      id
      complete
      text
    }
  `
)