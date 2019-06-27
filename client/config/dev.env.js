'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
	NODE_ENV: '"development"',
	URL: '"http://134.209.195.36"',
	GOOGLE_KEY: '"AIzaSyBZwoZjtlArLEEYsZFhS3f_YxJEDrX6km4"'
})
