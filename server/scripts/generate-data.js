const {
  GraphQLClient
} = require('graphql-request');

const subYears = require('date-fns/sub_years');
const startOfYear = require('date-fns/start_of_year');
const addMonths = require('date-fns/add_months');
const setHours = require('date-fns/set_hours');
const startOfHour = require('date-fns/start_of_hour');
const isBefore = require('date-fns/is_before');
const isAfter = require('date-fns/is_after');
const addDays = require('date-fns/add_days');
const subDays = require('date-fns/sub_days');

const FILLING = ["Strawberry", "Chocolate", "Blueberry", "Raspberry", "Vanilla"];
const TYPE = ["Cake", "Pastry", "Tart", "Muffin", "Biscuit", "Bread", "Bagel",
  "Bun", "Brownie", "Cookie", "Cracker", "Cheese Cake"
];
const FIRST_NAME = ["Ori", "Amanda", "Octavia", "Laurel", "Lael", "Delilah",
  "Jason", "Skyler", "Arsenio", "Haley", "Lionel", "Sylvia", "Jessica", "Lester",
  "Ferdinand", "Elaine", "Griffin", "Kerry", "Dominique"
];
const LAST_NAME = ["Carter", "Castro", "Rich", "Irwin", "Moore", "Hendricks",
  "Huber", "Patton", "Wilkinson", "Thornton", "Nunez", "Macias", "Gallegos",
  "Blevins", "Mejia", "Pickett", "Whitney", "Farmer", "Henry", "Chen", "Macias",
  "Rowland", "Pierce", "Cortez", "Noble", "Howard", "Nixon", "Mcbride", "Leblanc",
  "Russell", "Carver", "Benton", "Maldonado", "Lyons"
];

const ROLE_BAKER = 'baker';
const ROLE_BARISTA = 'barista';
const ROLE_ADMIN = 'admin';

const OrderState = {
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  PROBLEM: 'PROBLEM',
  CANCELLED: 'CANCELLED'
};

const createUserMutation = `
mutation (
  $email: String!,
  $firstName: String,
  $lastName: String,
  $role: String!,
  $locked: Boolean!) {
  createUser(input: {
    clientMutationId: "some-client-mutation-id"
    email: $email,
    firstName: $firstName,
    lastName: $lastName,
    role: $role,
    locked: $locked
  }) {
    user {
      id
    }
  }
}`;

const createProductMutation = `
mutation ($name: String!, $price: Int!) {
  createProduct(input: {
    clientMutationId: "some-client-mutation-id"
    name: $name,
    price: $price
  }) {
    product {
      id
    }
  }
}`;

const createPickupLocationMutation = `
mutation ($name: String!) {
  createPickupLocation(input: {
    clientMutationId: "some-client-mutation-id"
    name: $name
  }) {
    pickupLocation {
      id
    }
  }
}`;

function getRandomArrayItem(array) {
  return array[(Math.random() * (array.length - 1)) | 0];
}

function getRandomProductName() {
  const firstFilling = getRandomArrayItem(FILLING);
  let name;
  if (Math.random() > 0.5) {
    let secondFilling;
    do {
      secondFilling = getRandomArrayItem(FILLING);
    } while (secondFilling === firstFilling);

    name = firstFilling + " " + secondFilling;
  } else {
    name = firstFilling;
  }
  name += " " + getRandomArrayItem(TYPE);

  return name;
}

async function createBaker(client) {
  const data = await client.request(createUserMutation, {
    email: "baker@vaadin.com",
    firstName: "Heidi",
    lastName: "Carter",
    role: ROLE_BAKER,
    locked: false
  });
  return data.createUser.user.id;
}

async function createBarista(client) {
  const data = await client.request(createUserMutation, {
    email: "barista@vaadin.com",
    firstName: "Malin",
    lastName: "Castro",
    role: ROLE_BARISTA,
    locked: true
  });
  return data.createUser.user.id;
}

async function createAdmin(client) {
  const data = await client.request(createUserMutation, {
    email: "admin@vaadin.com",
    firstName: "Göran",
    lastName: "Rich",
    role: ROLE_ADMIN,
    locked: true
  });
  return data.createUser.user.id;
}

async function createDeletableUsers(client) {
  await client.request(createUserMutation, {
    email: "peter@vaadin.com",
    firstName: "Peter",
    lastName: "Bush",
    role: ROLE_BARISTA,
    locked: false
  });

  await client.request(createUserMutation, {
    email: "mary@vaadin.com",
    firstName: "Mary",
    lastName: "Ocon",
    role: ROLE_BAKER,
    locked: true
  });
}

async function createProducts(client, numberOfItems) {
  const products = [];
  for (let i = 0; i < numberOfItems; i++) {
    const doublePrice = 2.0 + Math.random() * 100.0;
    const product = {
      name: getRandomProductName(),
      price: (doublePrice * 100) | 0, // discard the decimal part
    }
    const data = await client.request(createProductMutation, product);
    products.push(data.createProduct.product.id);
  }

  return () => {
    // pseudo-gaussian random number from [0; 1]
    // https://stackoverflow.com/a/39187274
    let rand = 0;
    for (let i = 0; i < 6; i += 1) {
      rand += Math.random();
    }
    rand = rand / 6;
    return products[(rand * (products.length - 1)) | 0];
  };
}

async function createPickupLocations(client) {
  let create = async (name) => {
    const data = await client.request(createPickupLocationMutation, {
      name
    });
    return data.createPickupLocation.pickupLocation.id;
  };
  const pickupLocations = [
    await create("Store"),
    await create("Bakery"),
  ];
  return () => getRandomArrayItem(pickupLocations);
}

async function saveOrder(client, order) {
  const mutation = `
mutation {
  createOrder(input: {
    clientMutationId: "some-client-mutation-id",
    state: ${order.state},
    dueDate: "${order.dueDate.toISOString()}",
    customer: {
      fullName: "${order.customer.fullName}",
      phoneNumber: "${order.customer.phoneNumber}",
      details: "${order.customer.details || ''}"
    },
    pickupLocationId: "${order.pickupLocation}",
    history: [${order.history.map(item => `{
      newState: ${item.newState},
      timestamp: "${item.timestamp.toISOString()}",
      createdById: "${item.createdBy}"
    }`).join(',')}],
    items: [${order.items.map(item => `{
      quantity: ${item.quantity},
      totalPrice: ${item.totalPrice || 0},
      productId: "${item.product}"
    }`).join(',')}]
  }) {
    order {
      id
    }
  }
}`;
  const data = await client.request(mutation);
  return data.createOrder.order.id;
}

async function createOrders(client, productSupplier, pickupLocationSupplier, barista, baker) {
  const yearsToInclude = 2;
  const now = new Date();
  const oldestDate = startOfYear(subYears(now, yearsToInclude));
  const newestDate = addMonths(now, 1);

  // Create first today's order
  const order = createOrder(productSupplier, pickupLocationSupplier, barista, baker, now);
  order.dueDate = startOfHour(setHours(order.dueDate, 8));
  order.history = order.history.splice(1);
  order.items = order.items.splice(1);
  await saveOrder(client, order);

  for (let dueDate = oldestDate; isBefore(dueDate, newestDate); dueDate = addDays(dueDate, 1)) {
    // Create a slightly upwards trend - everybody wants to be successful
    const relativeYear = dueDate.getFullYear() - now.getFullYear() + yearsToInclude;
    const relativeMonth = relativeYear * 12 + dueDate.getMonth();
    const multiplier = 1.0 + 0.03 * relativeMonth;
    const ordersThisDay = (Math.random() * 10 + 1 * multiplier) | 0;
    for (let i = 0; i < ordersThisDay; i++) {
      await saveOrder(client, createOrder(productSupplier, pickupLocationSupplier, barista, baker, dueDate));
    }
  }
}

function getRandomPhoneNumber() {
  return "+1-555-" + (10000 + ((Math.random() * 10000) | 0));
}

function getRandomTime(date) {
  const time = 8 + 4 * ((Math.random() * 3) | 0);
  return startOfHour(setHours(date, time));
}

function getRandomState(due) {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const twoDays = addDays(today, 2);

  if (isBefore(due, today)) {
    if (Math.random() < 0.9) {
      return OrderState.DELIVERED;
    } else {
      return OrderState.CANCELLED;
    }
  } else {
    if (isAfter(due, twoDays)) {
      return OrderState.NEW;
    } else if (isAfter(due, tomorrow)) {
      // in 1-2 days
      const resolution = Math.random();
      if (resolution < 0.8) {
        return OrderState.NEW;
      } else if (resolution < 0.9) {
        return OrderState.PROBLEM;
      } else {
        return OrderState.CANCELLED;
      }
    } else {
      const resolution = Math.random();
      if (resolution < 0.6) {
        return OrderState.READY;
      } else if (resolution < 0.8) {
        return OrderState.DELIVERED;
      } else if (resolution < 0.9) {
        return OrderState.PROBLEM;
      } else {
        return OrderState.CANCELLED;
      }
    }
  }
}

function changeOrderState(order, user, state) {
  const createHistory = order.state !== state && !!order.state && !!state;
  order.state = state;
  if (createHistory) {
    order.history = order.history || [];
    order.history.push({
      timestamp: new Date(),
      message: "Order " + state,
      createdBy: user
    });
  }
}

function createOrderHistory(order, barista, baker) {
  const history = [];
  const item = {
    newState: OrderState.NEW,
    createdBy: barista,
    message: "Order placed",
  };

  const orderPlaced = setHours(subDays(order.dueDate, (Math.random() * 5 + 2) | 0), (Math.random() * 10 + 7) | 0);
  item.timestamp = orderPlaced;
  history.push(item);

  // TODO: add more
  order.history = history;
}

function containsProduct(items, product) {
  return items.some(item => item.product === product);
}

function createOrder(productSupplier, pickupLocationSupplier, barista, baker, dueDate) {
  const order = {
    state: OrderState.NEW
  };

  order.customer = {
    fullName: getRandomArrayItem(FIRST_NAME) + ' ' + getRandomArrayItem(LAST_NAME),
    phoneNumber: getRandomPhoneNumber()
  };

  if (Math.random() < 0.1) {
    order.customer.details = 'Very important customer';
  }

  order.pickupLocation = pickupLocationSupplier();
  order.dueDate = getRandomTime(dueDate);
  changeOrderState(order, barista, getRandomState(order.dueDate));

  const itemCount = ((Math.random() * 3) | 0);
  const items = [];
  for (let i = 0; i <= itemCount; i++) {
    const item = {};
    let product;
    do {
      product = productSupplier();
    } while (containsProduct(items, product));
    item.product = product;
    item.quantity = (Math.random() * 10 + 1) | 0;
    if (Math.random() < 0.2) {
      if (Math.random() < 0.5) {
        item.comment = "Lactose free";
      } else {
        item.comment = "Gluten free";
      }
    }
    items.push(item);
  }
  order.items = items;
  createOrderHistory(order, barista, baker);
  return order;
}

(async () => {
  try {
    await require('./reset-db')();

    const endpoint = 'http://localhost:60000/relay/v1/cjm0jfuyj000401527ycvcx3n';
    console.log("Generating demo data for ", endpoint);
    const client = new GraphQLClient(endpoint);

    console.log("... generating users");
    const baker = await createBaker(client);
    const barista = await createBarista(client);
    await createAdmin(client);
    // A set of products without constrains that can be deleted
    await createDeletableUsers(client);

    console.log("... generating products");
    // A set of products that will be used for creating orders.
    const productSupplier = await createProducts(client, 8);
    // A set of products without relationships that can be deleted
    await createProducts(client, 4);

    console.log("... generating pickup locations");
    const pickupLocationSupplier = await createPickupLocations(client);

    console.log("... generating orders");
    await createOrders(client, productSupplier, pickupLocationSupplier, barista, baker);

    console.log("Generated demo data");
  } catch (e) {
    console.log(e);
  }
})();

module.exports = {
  getRandomProductName
};