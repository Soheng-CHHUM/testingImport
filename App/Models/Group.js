import PropTypes from 'prop-types'

export default class Group {

    static propTypes = {
        name: PropTypes.string.isRequired,
        picture: PropTypes.string,
        isPublic: PropTypes.bool,
        tags: PropTypes.array,
        location: PropTypes.objectOf({
            latitude: PropTypes.number.isRequired,
            longitude: PropTypes.number.isRequired
        }),
        createdBy: PropTypes.string.isRequired,
        users: PropTypes.arrayOf(PropTypes.string)
    }

    static defaultProps = {
        picture: null,
        isPublic: true,
        tags: [],
        users: []
    }

    constructor(props) {
        this.name = props.name
        this.picture = props.picture
        this.isPublic = props.isPublic
        this.tags = props.tags
        this.location = props.location
        this.users = props.users
        this.createdBy = props.createdBy
        this.groupNameToLower = this.name.trim().toLowerCase()
    }
}
