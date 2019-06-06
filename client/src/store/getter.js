export const getters = {
	user: state => state.user,
	status: state => state.status,
	blocked: state => state.blocked,
	location: state => state.location,
	blockedBy: state => state.blockedBy,
	followers: state => state.followers,
	following: state => state.following,
	imageConvo: state => state.imageConvo,
	newMessage: state => state.newMessage,
	usernameConvo: state => state.usernameConvo,
	selectedConvo: state => state.selectedConvo,
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
		if (!state.user.images) return 'default.jpg'
		const image = state.user.images.filter(cur => cur.profile == true)[0]
		return image ? image.name : 'default.jpg'
	}
}
