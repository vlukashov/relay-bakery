import {graphql, commitMutation} from 'react-relay';

// We start by defining our mutation from above using `graphql`
const mutation = graphql`
  mutation ChangeTodoStatusMutation($input: ChangeTodoStatusInput!) {
    changeTodoStatus(input: $input) {
      todo {
        id
        complete
      }
    }
  }
`;

function commit(
  environment,
  complete,
  todo,
) {
  // Now we just call commitMutation with the appropriate parameters
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {complete, id: todo.id},
      },
      optimisticResponse: {
        changeTodoStatus: {
          todo: {
            id: todo.id,
            complete: complete,
          }
        }
      }
    }
  );
}

export default {commit};