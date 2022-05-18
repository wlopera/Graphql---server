import { ApolloServer, gql, UserInputError } from "apollo-server";
import axios from "axios";
import { v1 as uuid } from "uuid";

// Data proveniente de DUMMY - REST Api - Microservicio - BD
// const persons = [
//   {
//     age: "10",
//     name: "William",
//     phone: "502-457845",
//     street: "Ciudad de Panamá",
//     city: "Panamá",
//     id: "3d594650-m1",
//   },
//   {
//     age: "20",
//     name: "Andrés",
//     phone: "549-4287652",
//     street: "Buenos Aires",
//     city: "Argentina",
//     id: "3d594470-m2",
//   },
//   {
//     age: "27",
//     name: "Carlos",
//     street: "El Paramo",
//     city: "Chile",
//     id: "3d594875-m3",
//   },
// ];

// Data proveniente de REST Api (json server)
const { data: persons } = await axios.get("http://localhost:3000/persons");

//Describir los datos
const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

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
    allPersons(phone: YesNo): [Person]!
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

    editPhone(name: String!, phone: String!): Person
  }
`;

// Consultas
const resolvers = {
  Query: {
    personCount: () => persons.length,

    allPersons: async (root, args) => {
      if (!args.phone) {
        return persons;
      }

      return persons.filter((person) =>
        args.phone === "YES" ? person.phone : !person.phone
      );
    },

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

    editPhone: (root, args) => {
      const personIndex = persons.findIndex((per) => per.name === args.name);

      if (!personIndex === -1) return null;

      const person = persons[personIndex];
      const updatePerson = { ...person, phone: args.phone };
      person[personIndex] = updatePerson;

      return updatePerson;
    },
  },

  Person: {
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
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Servidor listo en ${url}`);
});
