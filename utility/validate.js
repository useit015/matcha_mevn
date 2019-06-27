const validateInput = (input, type) => {
	if (!input) return false
	switch (type) {
		case 'username':
			return !(input.length < 8 || input.length > 25 || /[^a-zA-Z0-9]+/.test(input))
		case 'password':
			return !(input.length < 8 || input.length > 255 || !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(input)))
		case 'email':
			return (/.+@.+/.test(input))
		case 'fname':
		case 'lname':
			return (input.length >= 3 && input.length <= 255 && !(/[^a-zA-Z]+/.test(input)))
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
