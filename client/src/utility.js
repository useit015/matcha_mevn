import Vue from 'vue'
import moment from 'moment'

const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)

const getDate = (item) => {
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

const syncLocation = async (location) => {
	try {
		const token = localStorage.getItem('token')
		const url = `http://134.209.195.36/api/action/position`
		const headers = { 'x-auth-token': token }
		await Vue.http.post(url, location, { headers })
	} catch (err) {
		console.log('error here -->', err)
	}
}

export default {
	getDate,
	syncLocation,
	getLocationFromIp,
	//getFullPath: file => isExternal(file) ? file : `http://134.209.195.36/static/uploads/${file ? file : 'default.jpg'}`,
	getFullPath: file => isExternal(file) ? file : `http://134.209.195.36/uploads/${file ? file : 'default.jpg'}`,
	formatTime (date) {
		const when = moment(getDate(date))
		return `${when.format('MMMM D, YYYY')} at ${when.format('h:mm A')}`
	},
	sync: async type => {
		try {
			const token = localStorage.getItem('token')
			const url = `http://134.209.195.36/api/users/get${type}`
			const headers = { 'x-auth-token': token }
			return await Vue.http.get(url, { headers })
		} catch (err) {
			console.log('error here -->', err)
		}
	},
	syncNotif: async () => {
		try {
			const token = localStorage.getItem('token')
			const url = `http://134.209.195.36/api/notif/all`
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
	}
}
