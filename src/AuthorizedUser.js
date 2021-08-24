import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Mutation } from 'react-apollo'
import { ROOT_QUERY } from './App'
import { gql } from 'apollo-boost'

const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code:String!) {
        githubAuth(code:$code) { token }
    }
`

class AuthorizedUser extends Component {

    state = { signingIn: false }

    authorizationComplete = ( cache, { data }) => {
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
            this.githubAuthMutation({ variables: {code} })
        }
    }

    //깃허브 OAuth로 리다이렉트시킴
    requestCode() {
        var clientID = `39426bead027bb647f22`
        window.location = `http://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
    }

    render() {
        return (
            <Mutation mutation={GITHUB_AUTH_MUTATION}
                update={this.authorizationComplete}
                refetchQueries={[{ query: ROOT_QUERY }]}>
                {mutation => {
                    this.githubAuthMutation = mutation 
                    return (
                        <button
                            onClick={this.requestCode}
                            disabled={this.state.signingIn}>
                            Sign In with GitHub
                        </button>
                    )
                }}
            </Mutation>
        )
    }
}

export default withRouter(AuthorizedUser)