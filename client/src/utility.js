import Vue from 'vue'

const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)

const translateLocation = loc => ({
	lat: Number(loc.latitude),
	lng: Number(loc.longitude)
})

const getLocationFromIp = f => {
	Vue.http.get('https://ipinfo.io?token=3443e12245bdcf')
			.then(res => {
				if (!res.error) {
					const splitted = res.body.loc.split(',')
					f({ lat: Number(splitted[0]), lng: Number(splitted[1]) })
				}
			}).catch(err => console.error(err))
}

const syncLocation = (id, location) => {
	Vue.http.post(`http://134.209.195.36/api/users/position/${id}`, location)
			.then(() => console.log('synced -->', location))
			.catch(err => console.error(err))
}

export default {
	syncLocation,
	getLocationFromIp,
	getFullPath: file => isExternal(file) ? file : `http://134.209.195.36/static/uploads/${file ? file : 'default.jpg'}`,
	sync: (f, id, type) => {
		Vue.http.post(`http://134.209.195.36/api/users/get${type}`, { id })
				.then(res => f(res))
				.catch(err => console.error(err))
	},
	calculateDistance: (from, to, mile) => {
		if (from.lat == to.lat && from.lng == to.lng)
			return 0
		else {
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
	updateLocation: id => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => syncLocation(id, {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
			}), () => getLocationFromIp(res => syncLocation(id, {
				lat: Number(res.lat),
				lng: Number(res.lng)
			})))
		} else {
			getLocationFromIp(res => syncLocation(id, {
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
	getDate (item) {
		switch (item.type) {
			case 'visitor':
				return item.visit_date
			case 'visited':
				return item.visit_date
			case 'follower':
				return item.match_date
			case 'following':
				return item.match_date
		}
	}
}
