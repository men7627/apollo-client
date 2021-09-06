import React, { Fragment, Component } from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import Users from './Users'
import Photos from './Photos'
import { gql } from 'apollo-boost'
import AuthorizedUser from './AuthorizedUser'
import { withApollo } from 'react-apollo'
import PostPhoto from './PostPhoto'

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    totalPhotos
    allUsers { ...userInfo }
    me { ...userInfo }
    allPhotos {
      id
      name
      url
    }
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
        <Switch>
          <Route
            exact
            path="/"
            component={() => (
              <Fragment>
                <AuthorizedUser />
                <Users />
                <Photos />
              </Fragment>
            )} />
          <Route path="/newPhoto" component={PostPhoto} />
          <Route component={({ location }) => <h1>"{location.pathname}" not found</h1>} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default withApollo(App)
