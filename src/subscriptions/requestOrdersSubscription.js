import {
  graphql,
  requestSubscription
} from 'react-relay';

import {
  ConnectionHandler
} from 'relay-runtime';

import startOfToday from 'date-fns/start_of_today';

const subscription = graphql `subscription requestOrdersSubscription {
  Order(
    filter: {
      mutation_in: [CREATED, DELETED]
    }
  ) {
    mutation
    node {
      id
      state
      dueDate
      customer {
        fullName
      }
      pickupLocation {
        name
      }
    }
    updatedFields
  }
}`;

function requestOrdersSubscription(environment, viewerId) {
  const filters = {
    // TODO: how to find the current connection filters to make the new
    // order immediately visible in the refetch container?
    // Currently this is hardcoded to match the value set in Home.js
    filter: {
      "dueDate_gte": startOfToday().toISOString()
    }
  };

  return requestSubscription(
    environment, {
      subscription: subscription,
      variables: {},
      updater: (store, data) => {
        // TODO: how to filter out own changes?
        // Currently after an order it created, it is added to the connection
        // twice: once by the mutation updater, and the second time by this
        // subscription updater.
        if (data.Order.mutation === 'CREATED') {
          // Cannot use a 'RANGE_ADD' config here because it expects an edge
          // in the response. Graphcool subscriptions do not support Relay
          // and therefore cannot return an edge.
          const newOrder = store.getRootField('Order').getLinkedRecord('node');
          const viewer = store.get(viewerId);
          const allOrders = ConnectionHandler.getConnection(viewer, 'OrderList_allOrders', filters);
          const edge = ConnectionHandler.createEdge(
            store,
            allOrders,
            newOrder,
            'OrderEdge',
          );
          ConnectionHandler.insertEdgeBefore(allOrders, edge);
        } else if (data.Order.mutation === 'DELETED') {
          const viewer = store.get(viewerId);
          const allOrders = ConnectionHandler.getConnection(viewer, 'OrderList_allOrders', filters);
          ConnectionHandler.deleteNode(allOrders, data.Order.node.id);
        }
      },
      onCompleted: () => console.log(`completed`),
      onError: error => console.log(`error`, error),
    }
  )
}

export default requestOrdersSubscription;