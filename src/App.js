import React, { Component } from 'react'
import Users from './Users'
import { BrowserRouter } from 'react-router-dom'
import { gql } from 'apollo-boost'
import AuthorizedUser from './AuthorizedUser'
import { withApollo } from 'react-apollo'

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers { ...userInfo }
    me { ...userInfo }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`

const LISTEN_FOR_USER = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`

class App extends Component {

  componentDidMount() {
    let { client } = this.props
    this.listenForUsers = client
      //ApolloClient의 subscribe : subscribe 작업을 서비스로 전달하는 역할 (옵저버 객체 반환)
      .subscribe({ query: LISTEN_FOR_USER })
      //Observer 객체의 subscribe : 옵저버로 하여금 핸들러를 사용하도록 만듬 (subscription을 통해 클라이언트로 데이터가 전달될 때마다 핸들러가 매번 호출)
      .subscribe(({ data: { newUser } }) => {
        const data = client.readQuery({ query: ROOT_QUERY })
        data.totalUsers += 1
        data.allUsers = [
          ...data.allUsers,
          newUser
        ]
        client.writeQuery({ query: ROOT_QUERY, data })
      })
  }

  componentWillUnmount() {
    this.listenForUsers.unsubscribe()
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <AuthorizedUser />
          <Users />
        </div>
      </BrowserRouter>
    )
  }
}

export default withApollo(App)
