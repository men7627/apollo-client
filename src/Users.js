import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { ROOT_QUERY } from './App'

const ADD_FAKE_USERS_MUTATION = gql`
    mutation addFakeUsers($count:Int!) {
        addFakeUsers(count:$count) {
            githubLogin
            name
            avatar
        }
    }
`

const Users = () =>
    <Query query={ROOT_QUERY} fetchPolicy="cache-first">
        {({ data, loading, refetch }) => loading ?
            <p>사용자 불러오는 중...</p> :
            <UserList count={data.totalUsers}
                users={data.allUsers}
                refetchUsers={refetch} />
        }
    </Query>

const UserList = ({ count, users, refetchUsers }) =>
    <div>
        <p>{count} Users</p>
        <button onClick={() => refetchUsers()}>다시 가져오기</button>
        <Mutation mutation={ADD_FAKE_USERS_MUTATION}
            variables={{ count: 1 }}
            //refetchQueries={[{ query: ROOT_QUERY }]} ADD_FAKE_USERS_MUTATION으로 추가된 사용자 리스트 바로 받아 오므로 불필요
            update={updateUserCache}> //캐시와 Mutation 응답 결과를 인자로 넘김
            {addFakeUsers =>
                <button onClick={addFakeUsers}>임시 사용자 추가</button>}
        </Mutation>
        <ul>
            {users.map(user =>
                <UserListItem key={user.githubLogin}
                    name={user.name}
                    avatar={user.avatar} />
            )}
        </ul>
    </div>

const UserListItem = ({ name, avatar }) =>
    <li>
        <img src={avatar} width={48} height={48} alt="" />
        {name}
    </li>

const updateUserCache = (cache, { data:{ addFakeUsers }}) => {
    let data = cache.readQuery({ query: ROOT_QUERY })
    data.totalUsers += addFakeUsers.length
    data.allUsers = [
        ...data.allUsers,
        ...addFakeUsers
    ]

    cache.writeQuery({ query: ROOT_QUERY, data })
}

export default Users