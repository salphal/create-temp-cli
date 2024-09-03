import downloadUrl from 'download';
import gitClone from 'git-clone';
import {rimraf} from 'rimraf';

const rm = rimraf.sync;

/**
 * 因为没有 es module 的倒出, 只能自己重新倒出
 * download-git-repo
 * https://gitlab.com/flippidippi/download-git-repo
 */

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */
export function download(repo: any, dest: string, opts: any, fn: Function) {
  if (typeof opts === 'function') {
    fn = opts
    opts = null
  }
  opts = opts || {}
  let clone = opts.clone || false
  delete opts.clone

  repo = normalize(repo)
  let url = repo.url || getUrl(repo, clone)

  if (clone) {
    let cloneOptions = {
      checkout: repo.checkout,
      shallow: repo.checkout === 'master',
      ...opts
    }
    gitClone(url, dest, cloneOptions, function (err) {
      if (err === undefined) {
        rm(dest + '/.git')
        fn()
      } else {
        fn(err)
      }
    })
  } else {
    let downloadOptions = {
      extract: true,
      strip: 1,
      mode: '666',
      ...opts,
      headers: {
        accept: 'application/zip',
        ...(opts.headers || {})
      }
    }
    downloadUrl(url, dest, downloadOptions)
      .then(function (data) {
        fn()
      })
      .catch(function (err) {
        fn(err)
      })
  }
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo: string) {
  let regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
  let match = regex.exec(repo)

  if (match) {
    let url = match[2]
    let directCheckout = match[3] || 'master'

    return {
      type: 'direct',
      url: url,
      checkout: directCheckout
    }
  } else {
    regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/
    match = regex.exec(repo)
    if (!match) return;
    let type = match[1] || 'github'
    let origin = match[2] || null
    let owner = match[3]
    let name = match[4]
    let checkout = match[5] || 'master'

    if (origin == null) {
      if (type === 'github') {
        origin = 'github.com'
      } else if (type === 'gitlab') {
        origin = 'gitlab.com'
      } else if (type === 'bitbucket') {
        origin = 'bitbucket.org'
      }
    }

    return {
      type: type,
      origin: origin,
      owner: owner,
      name: name,
      checkout: checkout
    }
  }
}

/**
 * Adds protocol to url in none specified
 *
 * @return {String}
 * @param origin
 * @param clone
 */
function addProtocol(origin: string, clone: string) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    if (clone) {
      origin = 'git@' + origin;
    } else {
      origin = 'https://' + origin;
    }
  }
  return origin;
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @param {String} clone
 * @return {String}
 */
function getUrl(repo: any, clone: string) {
  let url

  // Get origin with protocol and add trailing slash or colon (for ssh)
  let origin = addProtocol(repo.origin, clone)
  if (/^git@/i.test(origin)) {
    origin = origin + ':'
  } else {
    origin = origin + '/'
  }

  // Build url
  if (clone) {
    url = origin + repo.owner + '/' + repo.name + '.git'
  } else {
    if (repo.type === 'github') {
      url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip'
    } else if (repo.type === 'gitlab') {
      url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout
    } else if (repo.type === 'bitbucket') {
      url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip'
    }
  }

  return url
}
