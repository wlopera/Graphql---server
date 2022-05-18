# Graphql-server
Uso de Graphql server: Querys, mutation, type...

## Un lenguaje de consulta para su API
    GraphQL es un lenguaje de consulta para API y un tiempo de ejecución para cumplir con esas consultas con sus datos existentes. 
    GraphQL proporciona una descripción completa y comprensible de los datos en su API, brinda a los clientes el poder de solicitar 
    exactamente lo que necesitan y nada más, facilita la evolución de las API con el tiempo y habilita herramientas poderosas para 
    desarrolladores.
```
1.- Describa tus datos
    type Proyecto {
        name: String
        tagline: String
        contributors: [User]
    }

2.- Pide lo que quieras
    {
        project(name: "GraphQL") {
            tagline
        }
    }

3. - Obtenga resultados predecibles
    {
        "project": {
            "tagline": "A query language for APIs"
        }
    }
```   
### Graphql
```
Este paquete proporciona lógica para analizar consultas de GraphQL.
```

### Apollo/client
```
Este paquete único contiene prácticamente todo lo que necesita para configurar Apollo Client. Incluye caché en memoria, 
administración de estado local, manejo de errores y una capa de vista basada en React.
```
   
## Librerias
 * "apollo-server": "^3.7.0",
 * "graphql": "^16.5.0",
 * "nodemon": "^2.0.16",
 * "uuid": "^8.3.2"  

## index.js
```
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

```
## Salida

Levantar Servidor Graphql
> $ npx nodemon index.js
```
  [nodemon] 2.0.16
  [nodemon] to restart at any time, enter `rs`
  [nodemon] watching path(s): *.*
  [nodemon] watching extensions: js,mjs,json
  [nodemon] starting `node index.js`
```
Servidor listo en http://localhost:4000/

![Captura](https://user-images.githubusercontent.com/7141537/169056329-12fddc08-6a4e-49a2-8163-f00bbf99ec3c.PNG)
![Captura2](https://user-images.githubusercontent.com/7141537/169056334-d2dad173-e18f-43ae-9a84-3768379d8762.PNG)

## 3 Agregar Registro
![Captura3](https://user-images.githubusercontent.com/7141537/169056315-3e2c4edc-ab8b-4459-9931-7fca54e31634.PNG)

## 3 Manejo de errores
![Captura4](https://user-images.githubusercontent.com/7141537/169056324-2facfe5a-8c9f-48ce-af5a-7789d62eab13.PNG)

## Uso de ENUM: Modificar index.js

```diff
...
+ const typeDefinitions = gql`
+  enum YesNo {
+    YES
+    NO
+  }
...

...
const resolvers = {
  Query: {
    personCount: () => persons.length,

+    allPersons: (root, args) => {
+      if (!args.phone) {
+        return persons;
+      }

+      return persons.filter((person) =>
+        args.phone === "YES" ? person.phone : !person.phone
+      );
+    },

    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
...
```
![Captura](https://user-images.githubusercontent.com/7141537/169082496-052e1dc7-7d80-4e3a-9750-0ce750458520.PNG)
![Captura1](https://user-images.githubusercontent.com/7141537/169082487-63a41327-6d9d-4369-873d-13775e146f76.PNG)
![Captura2](https://user-images.githubusercontent.com/7141537/169082493-b9ea5729-52a3-489f-a162-720f1677f9d4.PNG)

## Modificar el número de teléfono - index.js
```diff
const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  ....
  
  type Mutation {
    addPerson(
      age: String!
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

+  editPhone(name: String!, phone: String!): Person
  }
  ....
`;
```
```diff
const resolvers = {
  ...
  
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

+    editPhone: (root, args) => {
+      const personIndex = persons.findIndex((per) => per.name === args.name);

+      if (!personIndex === -1) return null;

+      const person = persons[personIndex];
+      const updatePerson = { ...person, phone: args.phone };
+      person[personIndex] = updatePerson;

+      return updatePerson;
+    },
  },
  ...

```
![Captura](https://user-images.githubusercontent.com/7141537/169097401-c3d3ab0c-7336-4cc0-a33d-ed7be76ef20e.PNG)
![Captura1](https://user-images.githubusercontent.com/7141537/169097398-b9826fad-aecf-4ec1-82d0-3a02a2e19142.PNG)

## Consultas anidadas 
 * Realizar la misma consulta con parametros diferentes
 * ![Captura](https://user-images.githubusercontent.com/7141537/169099055-55c36500-3686-4d42-983f-aca789be9598.PNG)

 
 
