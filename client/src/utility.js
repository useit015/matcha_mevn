import Vue from 'vue'
import moment from 'moment'

const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)

const getDate = item => {
	if (!item) return new Date()
	switch (item.type) {
		case 'visitor':
			return item.visit_date
		case 'visited':
			return item.visit_date
		case 'follower':
			return item.match_date
		case 'following':
			return item.match_date
		default:
			return item
	}
}

const getLocationFromIp = async f => {
	try {
		const url = 'https://ipinfo.io?token=3443e12245bdcf'
		const res = await Vue.http.get(url)
		if (!res.error) {
			const splitted = res.body.loc.split(',')
			f({ lat: Number(splitted[0]), lng: Number(splitted[1]) })
		}
	} catch (err) {
		console.log('error here -->', err)
	}
}

const syncLocation = async location => {
	try {
		const token = localStorage.getItem('token')
		const url = `${process.env.URL}/api/action/position`
		const headers = { 'x-auth-token': token }
		await Vue.http.post(url, location, { headers })
	} catch (err) {
		console.log('error here -->', err)
	}
}

const isBlocked = (state, id) => state.blocked.includes(id) || state.blockedBy.includes(id)

const getId = tab => {
	switch (tab) {
		case 'notif':
			return 'id_from'
		case 'convos':
			return 'user_id'
		default:
			return 'id'
	}
}

export default {
	getDate,
	isBlocked,
	syncLocation,
	getLocationFromIp,
	getFullPath: file => isExternal(file) ? file : `${process.env.URL}/uploads/${file ? file : 'default.png'}`,
	formatTime (date) {
		const when = moment(getDate(date))
		const now = moment()
		let fmt = 'M/DD/YY, h:mm A'
		if (now.diff(when, 'weeks', true) < 1) {
			fmt = 'ddd h:mm A'
		} else if (now.diff(when, 'years', true) < 1) {
			fmt = 'MMMM D, YYYY, h:mm A'
		}
		return when.format(fmt)
	},
	sync: async type => {
		try {
			const token = localStorage.getItem('token')
			const url = `${process.env.URL}/api/users/get${type}`
			const headers = { 'x-auth-token': token }
			return await Vue.http.get(url, { headers })
		} catch (err) {
			console.log('error here -->', err)
		}
	},
	syncNotif: async () => {
		try {
			const token = localStorage.getItem('token')
			const url = `${process.env.URL}/api/notif/all`
			const headers = { 'x-auth-token': token }
			const result =  await Vue.http.get(url, { headers })
			return result.body.msg ? [] : result.body
		} catch (err) {
			console.log('error here -->', err)
		}
	},
	calculateDistance: (from, to, mile) => {
		if (Math.abs(from.lat - to.lat) <= 0.005 && Math.abs(from.lng - to.lng) <= 0.005) {
			return 0
		} else {
			const theta = from.lng - to.lng
			const radtheta = Math.PI * theta / 180
			from.rad = Math.PI * from.lat / 180
			to.rad = Math.PI * to.lat / 180
			let dist = Math.sin(from.rad) * Math.sin(to.rad) + Math.cos(from.rad) * Math.cos(to.rad) * Math.cos(radtheta)
			dist = dist > 1 ? 1 : dist
			dist = Math.acos(dist)
			dist = dist * 180 / Math.PI
			dist = dist * 60 * 1.1515
			return !mile ? dist * 1.609344 : dist
		}
	},
	updateLocation: () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => syncLocation({
				lat: pos.coords.latitude,
				lng: pos.coords.longitude
			}), () => getLocationFromIp(res => syncLocation({
				lat: Number(res.lat),
				lng: Number(res.lng)
			})))
		} else {
			getLocationFromIp(res => syncLocation({
				lat: Number(res.lat),
				lng: Number(res.lng)
			}))
		}
	},
	getHistoryAction (type) {
		switch (type) {
			case 'visited':
				return 'You visited'
			case 'visitor':
				return 'Visited your profile'
			case 'follower':
				return 'Liked you'
			case 'following':
				return 'You liked'
		}
	},
	getNotifMsg (notif) {
		switch (notif.type) {
			case 'visit':
				return ` checked your profile`
			case 'like':
				return ` liked you`
			case 'like_back':
				return ` liked you back`
			case 'unlike':
				return ` unliked you`
		}
	},
	getNotifIcon (type) {
		switch (type) {
			case 'visit':
				return 'visibility'
			case 'like':
				return 'favorite'
			case 'like_back':
				return 'favorite'
			case 'unlike':
				return 'favorite_border'
		}
	},
	filterBlocked (state, type) {
		return state[type].filter(cur => !isBlocked(state, cur[getId(type)]))
	},
	fromNow (date) {
		return moment.utc(date).fromNow()
	},
	showAlert (color, text, comp) {
		comp.alert = {
			state: true,
			color,
			text
		}
	},
	passMatch: (p1, p2) => {
		return !p1.length || p2 === p1 ? '' : 'Passwords must match'
	}
}
