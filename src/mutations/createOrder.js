import {
  commitMutation,
  graphql
} from 'react-relay';
import {
  ConnectionHandler
} from 'relay-runtime';
import startOfToday from 'date-fns/start_of_today';

const mutation = graphql `
  mutation createOrder_Mutation(
    $input: CreateOrderInput!
  ) {
    createOrder(input: $input) {
      order {
        ...Order_order
      }
    }
  }
`;

function sharedUpdater(store, viewerId, newOrder) {
  const viewer = store.get(viewerId);

  // TODO: how to find the current connection filters to make the new order
  // immediately visible in the pagination container?
  // Currently this is hardcoded to match the value set in Home.js
  const allOrders = ConnectionHandler.getConnection(viewer, 'OrderList_allOrders', {
    filter: {
      "dueDate_gte": startOfToday().toISOString()
    }
  });
  if (allOrders) {
    const newEdge = ConnectionHandler.createEdge(store, allOrders, viewer, 'OrderItemEdge');
    newEdge.setLinkedRecord(newOrder, 'node');
    ConnectionHandler.insertEdgeBefore(allOrders, newEdge);
  }
}

let counter = 0;

function createOrder(environment, viewerId, order) {
  const mutationId = `client:createOrder:${counter++}`;
  commitMutation(
    environment, {
      mutation,
      variables: {
        input: {
          clientMutationId: mutationId,
          dueDate: order.dueDate,
          state: 'NEW',
          customer: {
            fullName: order.customer.fullName,
            phoneNumber: order.customer.phoneNumber,
            details: order.customer.details
          },
          pickupLocationId: order.pickupLocationId,
          items: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            comment: item.comment,
            totalPrice: 0
          })),
        }
      },
      onCompleted: (response, errors) => {
        console.log(`${mutationId} completed`, response, errors);
      },
      onError: (error) => {
        console.error(`${mutationId} error`, error);
      },
      optimisticUpdater: (store) => {
        // 1 - create the `newOrder` as a mock that can be added to the store
        const newOrder = store.create(`${mutationId}:Order`, 'Order');
        newOrder.setValue(newOrder.getDataID(), 'id');
        newOrder.setValue('NEW', 'state');
        newOrder.setValue(order.dueDate, 'dueDate');

        const newCustomer = store.create(`${mutationId}:Customer`, 'Customer');
        newCustomer.setValue(order.customer.fullName + ' (lazy)', 'fullName');
        newCustomer.setValue(order.customer.phoneNumber, 'phoneNumber');
        newCustomer.setValue(order.customer.details, 'details');

        newOrder.setLinkedRecord(newCustomer, 'customer');
        newOrder.setLinkedRecord(store.get(order.pickupLocationId), 'pickupLocation');

        // TODO: how to create a connection manually?
        const newItemsConnection = store.create(`${mutationId}:OrderItemConnection`, 'OrderItemConnection');
        newOrder.setLinkedRecord(newItemsConnection, '__Order_items_connection');

        // 2 - create mock objects for each order item
        const items = ConnectionHandler.getConnection(newOrder, 'Order_items');
        order.items.forEach((item, i) => {
          const newItem = store.create(`${mutationId}:OrderItem:${i}`, 'OrderItem');
          newItem.setValue(newItem.getDataID(), 'id');
          newItem.setLinkedRecord(store.get(item.productId), 'product');
          newItem.setValue(item.quantity, 'quantity');
          newItem.setValue(item.comment, 'comment');
          newItem.setValue(0, 'totalPrice');

          const newEdge = ConnectionHandler.createEdge(store, items, newOrder, 'OrderItemEdge');
          newEdge.setValue(newItem.getDataID(), 'cursor');
          newEdge.setLinkedRecord(newItem, 'node');
          ConnectionHandler.insertEdgeAfter(items, newEdge);
        });

        const newPageInfo = store.create(`${mutationId}:PageInfo`, 'PageInfo');
        newPageInfo.setValue(false, 'hasNextPage');
        newItemsConnection.setLinkedRecord(newPageInfo, 'pageInfo');
        newItemsConnection.setValue(order.items.length, 'count');

        // 3 - add `newOrder` to the store
        sharedUpdater(store, viewerId, newOrder);
      },
      updater: (store) => {
        // 1 - retrieve the `newOrder` from the server response
        const newOrder = store.getRootField('createOrder').getLinkedRecord('order');

        // 2 - add `newOrder` to the store
        sharedUpdater(store, viewerId, newOrder);
      },
    },
  );
}

export default createOrder;