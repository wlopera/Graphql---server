import { ApolloServer, gql, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";

// Data proveniente de DUMMY - REST Api - Microservicio - BD
const persons = [
  {
    age: "10",
    name: "William",
    phone: "502-457845",
    street: "Ciudad de Panamá",
    city: "Panamá",
    id: "3d594650-m1",
  },
  {
    age: "20",
    name: "Andrés",
    phone: "549-4287652",
    street: "Buenos Aires",
    city: "Argentina",
    id: "3d594470-m2",
  },
  {
    age: "27",
    name: "Carlos",
    street: "El Paramo",
    city: "Chile",
    id: "3d594875-m3",
  },
];

//Describir los datos
//const typeDefs = gql`
const typeDefinitions = gql`
  type Address {
    street: String!
    city: String!
  }

  type Person {
    age: String!
    name: String!
    phone: String
    address: Address!
    check: String!
    isAdult: Boolean!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      age: String!
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`;

// Consultas
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((per) => per.name === args.name)) {
        //throw new Error("Este Nombre ya esta registrado!");

        throw new UserInputError("Campo debe ser único", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
  },

  Person: {
    // address: (root) => {
    //   console.log("root-address:", root);
    //   return `${root.street}-${root.city}`;
    // },
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    check: () => "wlopera",
    isAdult: (root) => root.age > 18,
  },
};

// Crear Servidor
const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Servidor listo en ${url}`);
});
