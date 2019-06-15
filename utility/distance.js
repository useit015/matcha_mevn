const calculateDistance = (from, to, mile) => {
	if (!to.lat || !to.lng) return Infinity
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
}

module.exports = calculateDistance
