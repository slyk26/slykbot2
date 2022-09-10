import Snoowrap, { Submission } from 'snoowrap';
import { ApiResponse, ResponseType } from './ApiResponse';
import config from './config.json';
import ufs from 'url-file-size';
import * as fs from 'fs';
import * as https from 'https';
import Catbox = require('catbox.moe');
import { getLoggerFor } from '../../utils/logger';

const logger = getLoggerFor('/reddit');

const litterbox = new Catbox.Litterbox();

const reddit = new Snoowrap({
	userAgent: config.userAgent,
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	refreshToken: process.env.REDDIT_REFRESH_TOKEN });

function fetchOneRandomFrom(subreddit: string) {
	return new Promise<Submission>((resolve, reject) => {
		reddit.getRandomSubmission(subreddit).then((response) => {
			// /random uri is disabled
			if (response.constructor.name !== 'Submission') {
				logger.warn('using fallback manual random search');
				let listingPromise = reddit.getHot(subreddit);

				switch (Number.parseInt('' + Math.random() * 5)) {
				case 0:
					listingPromise = reddit.getHot(subreddit);
					break;
				case 1:
					listingPromise = reddit.getTop(subreddit);
					break;
				case 2:
					listingPromise = reddit.getRising(subreddit);
					break;
				case 3:
					listingPromise = reddit.getControversial(subreddit);
					break;
				case 4:
					listingPromise = reddit.getNew(subreddit);
					break;
				}

				listingPromise.then(listing => {
					if (listing.length > 0) {
						resolve(listing[Number.parseInt('' + Math.random() * listing.length)]);
					}
					else {
						logger.warn('no posts found on /r' + subreddit);
						reject('no posts found on r/' + subreddit);
					}
				}).catch(reject);
			}
			else {
				resolve(response);
			}
		}).catch((e) => {
			const request = e.response.request;
			logger.warn(`couldn't fetch post from: ${request.href}`);
			switch (e.statusCode) {
			case 400:
				logger.warn('couldn\t request post');
				reject('couldn\'t request post');
				break;
			case 404:
				if (e.message.includes('banned')) {
					logger.warn(`subreddit r/${subreddit} is banned`);
					reject(`subreddit r/${subreddit} is banned`);
				}
				else {
					logger.warn(`subreddit r/${subreddit} doesn't exist`);
					reject(`subreddit r/${subreddit} doesn't exist`);
				}
				break;
			case 403:
				logger.warn(`subreddit r/${subreddit} is private`);
				reject('r/' + subreddit + ' is private');
				break;
			default:
				logger.error('reddit didn\'t respond');
				logger.debug(e);
				reject('reddit didn\'t respond');
				break;
			}
		});
	});
}

function processSubmission(submission: Submission) {
	return new Promise<ApiResponse>((resolve) => {
		// check if crosspost: yes => get original post url
		if (submission.crosspost_parent_list) {
			logger.debug(`post is crosspost (${submission.id})`);
			submission = submission.crosspost_parent_list[0];
		}

		// get .mp4 video
		if (submission.is_video) {
			resolve(getVideo(submission));
		}
		// get image
		else if (submission.domain === 'i.redd.it') {
			resolve(getImage(submission));
		}
		// get text post
		else if (submission.url.includes('/comments/')) {
			resolve(getTextPost(submission));
		}
		// get reddit gallery
		else if (submission.url.includes('/gallery/')) {
			resolve(getRedditGallery(submission));
		}
		// get link from external site
		else {
			resolve(handleExternalSite(submission));
		}
	});
}

// option 1: post is video
function getVideo(submission: Submission) {
	logger.debug(`submission is a video (id: ${submission.id})`);
	return new Promise<ApiResponse>((resolve, reject) => {
		// note: video url is never null
		const video_url = submission.media?.reddit_video?.fallback_url;
		const audio_url = video_url?.substring(0, video_url.lastIndexOf('/') + 1) + 'DASH_audio.mp4';
		const url = 'https://sd.redditsave.com/download.php?'
			+ 'permalink=https://reddit.com' + submission.permalink
			+ '&video_url=' + video_url
			+ '&audio_url=' + audio_url;

		ufs(url).then((size: number) => {
			if (size < config.uploadLimit) {
				logger.debug(`creating file (id: ${submission.id})`);
				const file = fs.createWriteStream(config.mediaFolder + submission.id + '.mp4');
				logger.debug(`file created (id: ${submission.id})`);

				file.on('error', e => {
					logger.debug(`file error (id: ${submission.id})`, { error: e });
					reject(e);
				}).on('finish', () => {
					file.close();
					logger.debug(`file closed (id: ${submission.id})`);
					resolve(new ApiResponse(submission.id, submission.title, file.path + '', ResponseType.VIDEO, submission.url));
				});

				https.get(url, response => {
					logger.debug(`getting data from url (id: ${submission.id})`);
					response.pipe(file);
				}).on('error', e => {
					logger.debug(`get request failed (id: ${submission.id})`);
					reject(e);
				});
			}
			else {
				const filesize = (size * 0.000001).toFixed(2);
				const max = (config.uploadLimit * 0.000001).toFixed(2);
				logger.warn(`filesize from link is too big: (${filesize}MB / ${max}MB) (id: ${submission.id})`);
				reject(`Filesize is too big to process (${filesize}. Supported is ${max}MB max. [Original Link](${submission.url})`);
			}
		}).catch((e: string) => {
			logger.warn(`${e}  ${submission.id})`);
			logger.debug(url);
			reject(e);
		});
	});

}

// option 2: post is image
function getImage(submission: Submission) {
	const isGif = submission.url.endsWith('.gif');
	if (isGif) {
		logger.debug(`submission is a gif (id: ${submission.id})`);
	}
	else {
		logger.debug(`submission is an image (id: ${submission.id})`);
	}
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.url, isGif ? ResponseType.GIF : ResponseType.IMAGE, submission.url));
}

// option 3: its a text post
function getTextPost(submission: Submission) {
	logger.debug(`submission is a textpost (id: ${submission.id})`);
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.selftext, ResponseType.TEXT, submission.url));
}

// option 4: reddit gallery ... wtf
function getRedditGallery(submission: Submission) {
	logger.debug(`submission is a gallery (id: ${submission.id})`);
	const gallery_links: string[] = [];
	let metadata;
	let url = '';

	Object.keys(submission.media_metadata).forEach(id => {
		metadata = submission.media_metadata[id].s;
		if (metadata.gif) {
			url = metadata.gif;
		}
		else {
			// if gallery is image, fix url
			url = metadata.u.replaceAll('amp;', '');
		}
		gallery_links.push(url);
	});
	return Promise.resolve(new ApiResponse(submission.id, submission.title, gallery_links, ResponseType.GALLERY, submission.url));
}

// option 5: its a link or embed to another website
function handleExternalSite(submission: Submission) {
	logger.debug(`submission is an external website (id: ${submission.id})`);
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.url, ResponseType.WEBSITE, submission.url));
}

// upload file to file host and return the url
function upload(response: ApiResponse) {
	return new Promise<ApiResponse>((resolve, reject) => {
		const filepath = response.content;
		if (typeof filepath === 'string') {
			logger.debug(`starting to upload (file: ${filepath})`);
			// if its a vid => upload to litterbox and return the url
			litterbox.upload(filepath).then((url: string) => {
				logger.debug(`file is uploaded (url: ${url})`);
				// after upload delete local file
				logger.debug(`deleting local file (file: ${filepath})`);
				fs.unlink(filepath, () => {
					logger.debug(`file successfully deleted (id: ${filepath})`);
					resolve(new ApiResponse(response.id, response.title, url, response.type, response.src));
				});
			}).catch((e: string) => {
				logger.debug(`file upload failed (file: ${filepath})`).debug(e);
				// if error from file host => delete orphaned file
				fs.unlink(filepath, () => {
					logger.debug(`deleting orphaned file (file: ${filepath})`);
					reject(e);
				});
			});
		}
		else {
			logger.debug(`Filepath is not a string (path: ${filepath})`);
			reject('Filepath is not a string: ' + filepath);
		}
	});
}

// checks if it can send result directly or needs to upload first
function prepareResult(response: ApiResponse) {
	return new Promise<ApiResponse>((resolve) => {
		if (typeof response.content === 'string' && response.content.startsWith(config.mediaFolder)) {
			// if is downloaded file (currently only mp4) => upload
			logger.debug(`response needs to be uploaded (id: ${response.id}) (file: ${response.content})`);
			resolve(upload(response));
		}
		else {
			logger.debug(`response can be sent directly (id: ${response.id}) (url: ${response.content})`);
			resolve(response);
		}
	});
}

// fetch process in a promise chain
export function getRandomPost(subreddit: string) {
	return new Promise<ApiResponse>(resolve => {
		fetchOneRandomFrom(subreddit)
			.then(processSubmission)
			.then(prepareResult)
			.then(response => {
				if (response.content.includes('database error')) {
					// retry on catbox error
					logger.warn(`invalid upload response: retrying (id: ${response.id})`);
					getRandomPost(subreddit);
				}
				resolve(response);
			}).catch(e => {
				resolve(new ApiResponse('-1', '', e, ResponseType.ERROR, 'intern'));
			});
	});
}

export function prepareReddit() {

	if (fs.existsSync(config.mediaFolder)) {
		logger.info('media folder exists');
	}
	else {
		logger.info('media folder does not exist');
		fs.mkdirSync(config.mediaFolder);
		logger.info('media folder created');
	}

	const files = fs.readdirSync(config.mediaFolder);
	files.length ? logger.info('deleting orphaned files from /reddit command') : null;
	files.forEach(file => {
		logger.debug(`deleting => ${file}`);
		fs.unlinkSync(config.mediaFolder + file);
	});
	files.length ? logger.info(`deleted ${files.length} orphaned files`) : null;
}