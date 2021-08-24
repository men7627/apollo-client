import React from 'react';
import { render } from 'react-dom';
import App from './App';
import ApolloClient, { gql } from 'apollo-boost'
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({ uri: 'http://localhost:4000/graphql' })

// const query = gql`
//   {
//     totalUsers
//     totalPhotos
//   }
// `

// console.log('cache', client.extract())
// client.query({query})
//   .then(({data}) => console.log('cache', client.extract()))
//   .catch(console.error)

render(
    <ApolloProvider client={client}>
      <App />,
    </ApolloProvider>, 
    document.getElementById('root')
)
