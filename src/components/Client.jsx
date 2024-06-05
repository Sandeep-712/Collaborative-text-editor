import Avatar from 'react-avatar'

const Client = ({ username , isCurrentuser }) => {
    return (
        <div className="client">
            <Avatar name={isCurrentuser ? "Me" : username} size="50" round='15px' />
            <span className='userName'>{isCurrentuser ? 'Me' : username}</span>
        </div>
    )
}

export default Client;