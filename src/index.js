import React from 'react';
import { render } from 'react-dom';
import App from './App';
import ApolloClient, { InMemoryCache } from 'apollo-boost'
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

const client = new ApolloClient({ 
  cache,
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

render(
    <ApolloProvider client={client}>
      <App />,
    </ApolloProvider>, 
    document.getElementById('root')
)
