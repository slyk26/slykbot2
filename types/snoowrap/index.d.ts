/* eslint no-mixed-spaces-and-tabs: "off"*/
import { Submission as S } from 'snoowrap';

declare module 'snoowrap' {
    // extending Submission with minimal required attribues
    // more optional attributes can be added as needed
    export class Submission extends S {
    	crosspost_parent_list: Submission[];
    	is_gallery: boolean;
    	media_metadata: Record<string, {
            id: string,
            s: { u: string, gif: string }
        }>;
    }
}