import PropTypes from 'prop-types'

export default class Chatroom {

    static propTypes = {
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        groupID: PropTypes.string,
        users: PropTypes.arrayOf(PropTypes.string),
        createdBy: PropTypes.string
    }

    constructor(props) {
        this.name = props.name
        this.users = props.users
        this.image = props.image
        this.groupID = props.groupID
        this.createdBy = props.createdBy

        this.usersKey = this.getChatroomKeyForUser(this.users)
    }

    getChatroomKeyForUser(users) {
        users = users.sort()

        return users.join(',')
    }
}
