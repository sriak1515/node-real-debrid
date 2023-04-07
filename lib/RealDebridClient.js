'use strict'

const axios = require('axios')
const errors = require('./ErrorCodes')

class RealDebridClient {

	constructor (token, defaultOptions = {}) {

		this.token = token
		this.defaultOptions = defaultOptions
		this.base_url = 'https://api.real-debrid.com/rest/1.0/'
		this._initMethods()

		}

	_request (endpoint, o = {}) {

		const url = this.base_url + endpoint

		const options = Object.assign({}, this.defaultOptions)
		options.url = url
		options.json = true
		options.headers = options.headers || {}
		options.headers['Authorization'] = 'Bearer ' + this.token

		for (let i in o) {
			options[i] = o[i]
		}

		return new Promise((resolve, reject) => {
		        axios(options.url, options).then(resolve).catch(reject)})
	}

	_get (endpoint, options = {}) {
		options.method = 'get'
		return this._request(endpoint, options)
	}

	_post (endpoint, options = {}) {
		options.method = 'post'
		return this._request(endpoint, options)
	}

	_put (endpoint, options = {}) {
		options.method = 'put'
		return this._request(endpoint, options)
	}

	_delete (endpoint, options = {}) {
		options.method = 'delete'
		return this._request(endpoint, options)
	}

	disableAccessToken () {
		return this._get('disable_access_token')
	}

	_initMethods () {
		this.time = {
			get: () => {
				return this._get('time')
			},
			ISO: () => {
				return this._get('time/iso')
			}
		}

		this.user = {
			get: () => {
				return this._get('user')
			}
		}

		this.unrestrict = {
			check: (link, password = null) => {
				return this._post('unrestrict/check', {
					data: `link=${link}&password=${password}`
				})
			},
			link: (link, password = null, remote = 0) => {
				return this._post('unrestrict/link', {
					data: `link=${link}&password=${password}&remote=${remote}`
				})
			},
			folder: link => {
				return this._post('unrestrict/folder', {
					data: `link=${link}`
				})
			},
			containerFile: file => {
				let stream = (file.Readable) ? file : this._readFile(file)
				return this._put('unrestrict/containerFile', {
					body: stream,
					binary: true,
					json: false,
					headers: {
						'Authorization': 'Bearer ' + this.token
					}
				})

			},
			containerLink: link => {
				return this._post('unrestrict/containerLink', {
					data: `link=${link}`
				})
			}
		}

		this.traffic = {
			get: () => {
				return this._get('traffic')
			},
			details: (start = null, end = null) => {
				return this._get('traffic/details', {
					qs: {
						start,
						end
					}
				})
			}
		}

		this.streaming = {
			transcode: id => {
				return this._get('streaming/transcode/' + id)
			},
			mediaInfos: id => {
				return this._get('streaming/mediaInfos/' + id)
			}
		}

		this.downloads = {
			get: (offset = null, page = null, limit = 50) => {
				return this._get('downloads', {
					offset,
					page,
					limit
				})
			},
			delete: id => {
				return this._delete('downloads/delete/' + id)
			}
		}

		this.torrents = {
			get: (offset = null, page = null, limit = 50, filter = '') => {
				return this._get('torrents', {
					qs: {
						offset,
						page,
						limit,
						filter
					}
				})
			},
			info: id => {
				return this._get('torrents/info/' + id)
			},
			availableHosts: () => {
				return this._get('torrents/availableHosts')
			},
			instantAvailability: infoHashes => {
				return this._get(`torrents/instantAvailability/${infoHashes.join('/')}`)
			},
			addTorrent: (file, host = null, split = null) => {
				let stream = (file.Readable) ? file : this._readFile(file)
				return this._put('torrents/addTorrent', {
					body: stream,
					binary: true,
					json: false,
					qs: {
						host: host,
						split: split
					},
					headers: {
						'Authorization': 'Bearer ' + this.token
					}
				})
			},
			addMagnet: (magnet, host = null, split = null) => {
				return this._post('torrents/addMagnet', {
					data: `magnet=${magnet}&host=${host}&split=${split}`
				})
			},
			selectFiles: (id, files = 'all', check_cache = 1) => {
				return this._post('torrents/selectFiles/' + id, {
					data: `files=${files}&check_cache=${check_cache}`
				})
			},
			delete: id => {
				return this._delete('torrents/delete/' + id)
			}
		}

		this.hosts = {
			get: () => {
				return this._get('hosts')
			},
			status: () => {
				return this._get('hosts/status')
			},
			regex: () => {
				return this._get('hosts/regex')
			},
			domains: () => {
				return this._get('hosts/domains')
			}
		}

		this.forum = {
			get: (id = null) => {
				if (typeof forum === 'undefined') {
					return this._get('forum')
				} else {
					return this._get('forum/' + id)
				}
			},
			topic: id => {
				return this.forum().get(id)
			}
		}

		this.settings = {
			get: () => {
				return this._get('settings')
			},
			update: (setting_name = null, setting_value = null) => {
				return this._post('settings/update', {
					data: `setting_name=${setting_name}&setting_value=${setting_value}`
				})
			},
			convertPoints: () => {
				return this._post('settings/convertPoints')
			},
			changePassword: () => {
				return this._post('settings/changePassword')
			},
			avatarFile: file => {
				let stream = (file.Readable) ? file : this._readFile(file)
				return this._put('settings/avatarFile', {
					body: stream,
					binary: true,
					json: false,
					headers: {
						'Authorization': 'Bearer ' + this.token
					}
				})
			},
			deleteAvatar: () => {
				return this.delete('settings/avatarDelete')
			}
		}

	}

}

module.exports = RealDebridClient
