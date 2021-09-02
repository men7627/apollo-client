import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Query, Mutation, compose, withApollo } from 'react-apollo'
import { ROOT_QUERY } from './App'
import { gql } from 'apollo-boost'

const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code:String!) {
        githubAuth(code:$code) { token }
    }
`

const Me = ({ logout, requestCode, signingIn }) =>
    <Query query={ROOT_QUERY}>
        {({ loading, data }) => data.me ?
            <CurrentUser {...data.me} logout={logout} /> :
            loading ?
                <p>loading...</p> :
                <button
                    onClick={requestCode}
                    disabled={signingIn}>
                    Sign In With GitHub
                </button>
        }
    </Query>

const CurrentUser = ({ name, avatar, logout }) =>
    <div>
        <img src={avatar} width={48} height={48} alt="" />
        <h1>{name}</h1>
        <button onClick={logout}>logout</button>
    </div>

class AuthorizedUser extends Component {

    state = { signingIn: false }

    authorizationComplete = (cache, { data }) => {
        localStorage.setItem('token', data.githubAuth.token)

        //ReactRouter에서 전달한 프로퍼티 history를 조작
        this.props.history.replace('/')
        this.setState({ signingIn: false })
    }

    //컴포넌트가 마운트된 직후 this.githubAuthMutation 호출
    //code 파싱
    componentDidMount() {
        if (window.location.search.match(/code=/)) {
            this.setState({ signingInIn: true })
            const code = window.location.search.replace("?code=", "")
            this.githubAuthMutation({ variables: { code } })
        }
    }

    //깃허브 OAuth로 리다이렉트시킴
    requestCode() {
        var clientID = `39426bead027bb647f22`
        window.location = `http://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
    }

    render() {
        return (
            <Mutation
                mutation={GITHUB_AUTH_MUTATION}
                update={this.authorizationComplete}
                refetchQueries={[{ query: ROOT_QUERY }]}>
                {mutation => {
                    this.githubAuthMutation = mutation
                    return (
                        <Me signingIn={this.state.signingIn}
                            requestCode={this.requestCode}
                            logout={() => {
                                localStorage.removeItem('token')
                                let data = this.props.client.readQuery({ query: ROOT_QUERY })
                                data.me = null
                                this.props.client.writeQuery({ query: ROOT_QUERY, data })
                                // this.props.history.go(0);
                            }} />
                    )
                }}
            </Mutation>
        )
    }
}

export default compose(withApollo, withRouter)(AuthorizedUser)