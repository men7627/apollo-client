import React from 'react';
import { render } from 'react-dom';
import App from './App';
import ApolloClient, { gql } from 'apollo-boost'
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({ 
  uri: 'http://localhost:4000/graphql',

  //요청 메서드 추가
  //요청 보내기 전 모든 operation에 세부 정보를 추가할 수 있는 메서드
  //operation context에 세부 정보 추가
  request: operation => {
    operation.setContext(context => ({
      headers: {
        ...context.headers,
        authorization: localStorage.getItem('token')
      }
    }))
  }
 })

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
