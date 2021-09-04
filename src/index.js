import {
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ApolloClient,
  split
} from 'apollo-boost'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { ApolloProvider } from 'react-apollo';
import { persistCache } from 'apollo-cache-persist';

console.log(localStorage['apollo-cache-persist'])

const cache = new InMemoryCache()

//브라우저 창의 localStorage 스토어에 캐시를 보관
persistCache({
  cache,
  storage: localStorage
})

//애플리케이션 시작 시에 localStorage 존재 여부 체크해 이미 캐시가 존재하는지 확인
//존재하면 클라이언트 생성 전에 cache 초기화
if(localStorage['apollo-cache-persist']) {
  let cacheData = JSON.parse(localStorage['apollo-cache-persist'])
  cache.restore(cacheData)
}

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' })
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: { reconnect: true }
})

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(context => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem('token')
    }
  }))
  return forward(operation)
})

const httpAuthLink = authLink.concat(httpLink)

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpAuthLink
)

const client = new ApolloClient({ cache, link })

render(
    <ApolloProvider client={client}>
      <App />,
    </ApolloProvider>, 
    document.getElementById('root')
)
