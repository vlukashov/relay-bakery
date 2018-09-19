import {
  commitMutation,
  graphql
} from 'react-relay';

import startOfToday from 'date-fns/start_of_today';

const mutation = graphql `
  mutation createOrder_Mutation(
    $input: CreateOrderInput!
  ) {
    createOrder(input: $input) {
      edge {
        node {
        ...Order_order
        }
      }
    }
  }
`;

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
      optimisticResponse: {
        createOrder: {
          edge: {
            node: {
              id: `${mutationId}:Order`,
              state: 'NEW',
              dueDate: order.dueDate,
              customer: {
                fullName: order.customer.fullName + ' (optimistic)',
                phoneNumber: order.customer.phoneNumber,
                details: order.customer.details,
              },
              pickupLocation: {
                id: order.pickupLocationId
              },
              items: {
                edges: order.items.map((item, i) => {
                  return {
                    node: {
                      id: `${mutationId}:OrderItem:${i}`,
                      quantity: item.quantity,
                      comment: item.comment,
                      totalPrice: 0,
                      product: {
                        id: item.productId
                      }
                    }
                  }
                })
              }
            }
          }
        }
      },
      configs: [{
        type: 'RANGE_ADD',
        parentID: viewerId,
        connectionInfo: [{
          key: 'OrderList_allOrders',
          filters: {
            // TODO: how to find the current connection filters to make the new
            // order immediately visible in the refetch container?
            // Currently this is hardcoded to match the value set in Home.js
            filter: {
              "dueDate_gte": startOfToday().toISOString()
            }
          },
          rangeBehavior: 'prepend',
        }],
        edgeName: 'edge',
      }],
      onCompleted: (response, errors) => {
        console.log(`${mutationId} completed`, response, errors);
      },
      onError: (error) => {
        console.error(`${mutationId} error`, error);
      },
    },
  );
}

export default createOrder;