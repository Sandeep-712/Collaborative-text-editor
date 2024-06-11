import Avatar from 'react-avatar'

// eslint-disable-next-line react/prop-types
const Client = ({ username, isCurrentUser }) => {
    return (
        <div className="client">
            <Avatar name={isCurrentUser ? 'ME' : username} size={50} round="14px" />
            <span className="userName">{isCurrentUser ? `Me(${username})` : username}</span>
        </div>
    )
}

export default Client;