import { buildSchema } from 'graphql';



const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = { hello: () => 'Hello world!' };

const graphql = {
  schema: schema,
  rootValue: root,
  graphiql: true,
};

export default graphql;
