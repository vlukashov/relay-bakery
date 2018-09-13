import React from 'react';
import PropTypes from 'prop-types';
import {graphql, createFragmentContainer} from 'react-relay';


class Todo extends React.Component {
  static propTypes = {
    todo: PropTypes.shape({
      complete: PropTypes.boolean,
      text: PropTypes.string,
    }),
  }

  render() {
    const {complete, text} = this.props.todo;

    return (
      <li>
        <div>
          <input
            checked={complete}
            type="checkbox"
          />
          <label>
            {text}
          </label>
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(
  Todo,
  graphql`
    # As a convention, we name the fragment as '<ComponentFileName>_<propName>'
    fragment Todo_todo on Todo {
      complete
      text
    }
  `
)