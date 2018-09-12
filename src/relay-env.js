import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

function fetchQuery(
  operation,
  variables,
) {
  const url = new URL("/graphql", window.location.origin);
  const params = {
    query: operation.text,
    variables: JSON.stringify(variables),
  };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url).then(response => {
    return response.json();
  });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

export default environment;
