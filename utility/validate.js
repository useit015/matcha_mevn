const validateInput = (input, type) => {
	if (!input) return false
	switch (type) {
		case 'username':
			return !(input.length < 8 || input.length > 25)
		case 'password':
			return !(input.length < 6 || input.length > 255 || !(/^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(input)))
		case 'email':
			return (/.+@.+/.test(input))
		case 'fname':
		case 'lname':
			return (input.length >= 3 && input.length <= 255)
		case 'looking':
			return !(input != 'male' && input != 'female' && input != 'both')
		case 'gender':
			return !(input != 'male' && input != 'female')
		case 'msg':
			return (input.length > 0 && input.length < 2048)
		default:
			return false
	}
}

module.exports = validateInput
