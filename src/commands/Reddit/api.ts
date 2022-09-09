import Snoowrap, { Submission, Listing } from 'snoowrap';
import { ApiResponse, ResponseType } from './ApiResponse';
import config from './config.json';
import ufs from 'url-file-size';
import * as fs from 'fs';
import * as https from 'https';
import Catbox = require('catbox.moe');

const litterbox = new Catbox.Litterbox();

const reddit = new Snoowrap({
	userAgent: config.userAgent,
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	refreshToken: process.env.REDDIT_REFRESH_TOKEN });

function fetchOneRandomFrom(subreddit: string) {
	return new Promise<Submission>((resolve, reject) => {
		reddit.getRandomSubmission(subreddit).then((response) => {
			// if no posts found or /random uri is disabled
			if (response.constructor.name !== 'Submission') {
				let listingPromise: Promise<Listing<Submission>> = Promise.reject();

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
					if (listing. length > 0) {
						resolve(listing[Number.parseInt('' + Math.random() * listing.length)]);
					}
					else {
						reject('no posts found on r/' + subreddit);
					}
				}).catch(reject);
			}
			else {
				resolve(response);
			}
		}).catch((e) => {
			switch (e.statusCode) {
			case 400:
				console.log(e.href);
				reject('[400] post is unavailable');
				break;
			case 404:
				reject('[404] r/' + subreddit + ' is banned');
				break;
			case 403:
				reject('[403] r/' + subreddit + ' is private');
				break;
			default:
				reject('[FATAL] ' + e);
				break;
			}
		});
	});
}

function processSubmission(submission: Submission) {
	return new Promise<ApiResponse>((resolve) => {
		// check if crosspost: yes => get original post url
		if (submission.crosspost_parent_list) {
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
				const file = fs.createWriteStream(config.mediaFolder + submission.id + '.mp4');

				file.on('error', reject).on('finish', () => {
					file.close();
					resolve(new ApiResponse(submission.id, submission.title, file.path + '', ResponseType.VIDEO, submission.url));
				});

				https.get(url, response => {
					response.pipe(file);
				}).on('error', reject);
			}
			else {
				const inMB = size * 0.000001;
				reject(`File is too big to process (${inMB.toFixed(2)}MB). Supported is 8MB max. [Original Link](${submission.url})`);
			}
		}).catch(reject);
	});

}

// option 2: post is image
function getImage(submission: Submission) {
	const isGif = submission.url.endsWith('.gif');
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.url, isGif ? ResponseType.GIF : ResponseType.IMAGE, submission.url));
}

// option 3: its a text post
function getTextPost(submission: Submission) {
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.selftext, ResponseType.TEXT, submission.url));
}

// option 4: reddit gallery ... wtf
function getRedditGallery(submission: Submission) {
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
	return Promise.resolve(new ApiResponse(submission.id, submission.title, submission.url, ResponseType.WEBSITE, submission.url));
}

// upload file to file host and return the url
function upload(response: ApiResponse) {
	return new Promise<ApiResponse>((resolve, reject) => {
		const filepath = response.content;
		if (typeof filepath === 'string') {
			// if its a vid => upload to litterbox and return the url
			litterbox.upload(filepath).then((url: string) => {
			// after upload delete local file
				fs.unlink(filepath, () => {
					resolve(new ApiResponse(response.id, response.title, url, response.type, response.src));
				});
			}).catch((e: string) => {
			// if error from file host => delete orphaned file
				fs.unlink(filepath, () => {
					reject(e);
				});
			});
		}
		else {
			reject('Filepath is not a string: ' + filepath);
		}
	});
}

// checks if it can send result directly or needs to upload first
function prepareResult(response: ApiResponse) {
	return new Promise<ApiResponse>((resolve) => {
		if (typeof response.content === 'string' && response.content.startsWith(config.mediaFolder)) {
			// if is downloaded file (currently only mp4) => upload
			resolve(upload(response));
		}
		else {
			resolve(response);
		}
	});

}

// fetch process in a promise chain
export function getRandomPost(subreddit: string) {
	return new Promise<ApiResponse>((resolve, reject) => {
		fetchOneRandomFrom(subreddit)
			.then(processSubmission)
			.then(prepareResult)
			.then(response => {
				if (response.content.includes('database error')) {
					// retry on catbox error
					getRandomPost(subreddit);
				}
				resolve(response);
			}).catch(reject);
	});
}