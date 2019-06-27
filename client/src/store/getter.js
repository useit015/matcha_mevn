import utility from '../utility'

export const getters = {
	user: state => state.user,
	tags: state => state.tags.filter(cur => cur.length),
	notif: state => state.notif,
	typing: state => state.typing,
	online: state => state.online,
	status: state => state.status,
	blocked: state => state.blocked,
	location: state => state.location,
	typingSec: state => state.typingSec,
	seenConvo: state => state.seenConvo,
	blockedBy: state => state.blockedBy,
	blacklist: state => state.blacklist,
	followers: state => state.followers,
	newMessage: state => state.newMessage,
	selectedConvo: state => state.selectedConvo,
	convos: state => [...state.convos].sort((a, b) => new Date(b.last_update) - new Date(a.last_update)),
	following: state => state.following,
	imageConvo: state => {
		const convo = state.convos.find(cur => cur.id_conversation == state.selectedConvo)
		return convo ? convo.profile_image : null
	},
	usernameConvo: state => {
		const convo = state.convos.find(cur => cur.id_conversation == state.selectedConvo)
		return convo ? convo.username : null
	},
	idUserConvo: state => {
		const convo = state.convos.find(cur => cur.id_conversation == state.selectedConvo)
		return convo ? convo.user_id : null
	},
	history: state => {
		return [
			...state.visitor.map(cur => ({
				...cur,
				type: 'visitor'
			})),
			...state.visited.map(cur => ({
				...cur,
				type: 'visited'
			})),
			...state.followers.map(cur => ({
				...cur,
				type: 'follower'
			})),
			...state.following.map(cur => ({
				...cur,
				type: 'following'
			}))
		]
	},
	matches: state => state.following.filter(cur => {
		for (const follower of state.followers)
			if (follower.id == cur.id)
				return true
		return false
	}),
	profileImage: state => {
		if (!state.user.images) return 'default.png'
		const image = state.user.images.find(cur => cur.profile)
		return utility.getFullPath(image ? image.name : 'default.png')
	},
	coverPhoto: state => {
		const cover = 'https://images.pexels.com/photos/96422/pexels-photo-96422.jpeg'
		if (!state.user.images) return cover
		const image = state.user.images.find(cur => cur.cover)
		return utility.getFullPath(image ? image.name : cover)
	}
}
